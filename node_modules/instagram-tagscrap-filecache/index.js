const https = require('https'),
    extend = require('extend'),
    Promise = require('bluebird'),
    CachemanFile = require('cacheman-file'),
    listURL = 'https://www.instagram.com/explore/tags/',
    postURL = 'https://www.instagram.com/p/',
    locURL  = 'https://www.instagram.com/explore/locations/',
    dataExp = /window\._sharedData\s?=\s?({.+);<\/script>/;


const parse = function(html) {
    let json;
    try {
        let dataString = html.match(dataExp)[1];
        json = JSON.parse(dataString);
    }
    catch(e) {
        if (process.env.NODE_ENV !== 'production') {
            console.error('The HTML returned from instagram was not suitable for scraping');
        } else {
            throw new Error('The HTML returned from instagram was not suitable for scraping');
        }
        return null
    }

    return json;
};


const Instagram = function (options) {
    const self = this;

    this._config = {};

    extend(this._config, {
        cache : {
            prefix : 'ig-',
            isIgnore : false,
            isRequestErrorCover : false,
            ttl : 60 * 30, // 30 min
            tmpDir : null
        }
    }, options);

    this._cache = this.__cache();

    if(!this._config.cache.isIgnore) {
        this._cachemanInstance = new CachemanFile({
            tmpDir: this._config.tmpDir
        });
    }
};

Instagram.prototype.__cache = function() {
    const self = this;

    return {
        get: id => new Promise((resolve, reject) => {
            self._cachemanInstance.get(self._config.cache.prefix + id, (err, value) => {
                if (err) {
                    reject(err);
                } else if (value === null) {
                    reject({
                        reason : 'Nothing'
                    });
                } else if (value.expire < Date.now()) {
                    reject({
                        reason : 'Expired',
                        value : value.data
                    });
                } else {
                    resolve(value);
                }
            });
        }),
        set: (id, val) => new Promise((resolve, reject) => {
            const cachemanTtl = self._config.cache.isRequestErrorCover ? (self._config.cache.ttl * 1000) : self._config.cache.ttl;
            const value = {
                data: val,
                expire: Date.now() + self._config.cache.ttl
            };

            self._cachemanInstance.set(self._config.cache.prefix + id, value, cachemanTtl, (err, value) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(value);
                }
            });
        })
    }
};

Instagram.prototype._request = function(id, uri){
    const self = this;
    const req = function(){
        return new Promise((resolve, reject)=>{
            const callback = res => {
                if(res.statusCode !== 200) {
                    reject(new Error('Status code is not 200'));
                } else {
                    let resData = '';

                    res
                        .on('data', d => {
                            resData += d.toString();
                        })
                        .on('end', d => {
                            resolve(resData);
                        })
                    ;
                }
            };

            https.get(uri, callback).on('error', (e) => {
                reject(e);
            });
        });
    };

    return (!this._cache || this._config.cache.isIgnore) ? req() : new Promise((resolve, reject) => {
        this._cache.get(id)
            .then(value => {
                resolve(value);
            })
            .catch((cacheErr) => {
                if(cacheErr.reason === 'Nothing' || cacheErr.reason === 'Expired'){
                    req()
                        .then((response) => {
                            return self._cache.set(id, response)
                                .then(r => {
                                    // console.log('--')
                                    resolve(response);
                                })
                            ;
                        })
                        .catch((reqErr) => {
                            // console.log('1--')
                            if(this._config.cache.isRequestErrorCover && cacheErr.value){
                                // console.log('2--')
                                resolve(cacheErr.value);
                            } else {
                                // console.log('3--', reqErr)
                                reject(reqErr);
                            }
                        })
                    ;
                } else {
                    reject(cacheErr);
                }
            })
        ;
    });
};

Instagram.prototype.deepScrapeTagPage = function(tag){
    const self = this;

    return new Promise(function(resolve, reject){
        self.scrapeTagPage(tag).then(function(tagPage){
            return Promise.map(tagPage.media, function(media, i, len) {
                return self.scrapePostPage(media.code).then(function(postPage){
                    tagPage.media[i] = postPage;
                    if (postPage.location != null && postPage.location.has_public_page) {
                        return self.scrapeLocationPage(postPage.location.id).then(function(locationPage){
                            tagPage.media[i].location = locationPage;
                        })
                            .catch(function(err) {
                                console.log("An error occurred calling scrapeLocationPage inside deepScrapeTagPage" + ":" + err);
                            });
                    }
                })
                    .catch(function(err) {
                        console.log("An error occurred calling scrapePostPage inside deepScrapeTagPage" + ":" + err);
                    });
            })
                .then(function(){ resolve(tagPage); })
                .catch(function(err) {
                    console.log("An error occurred resolving tagPage inside deepScrapeTagPage" + ":" + err);
                });
        })
            .catch(function(err) {
                console.log("An error occurred calling scrapeTagPage inside deepScrapeTagPage" + ":" + err);
            });
    });

};


Instagram.prototype.scrapeTagPage = function(tag){
    const self = this;

    return new Promise(function(resolve, reject){
        if (!tag) return reject(new Error('Argument "tag" must be specified'));

        tag = encodeURI(tag);

        self._request('tag-'+tag, listURL + tag + '/')
            .then((body) => {

                const data = parse(body);

                if(data &&
                    data.entry_data &&
                    data.entry_data.TagPage
                ) {
                    const media = (function(TagPage) {
                        if (TagPage.graphql &&
                            TagPage.graphql.hashtag &&
                            TagPage.graphql.hashtag.edge_hashtag_to_media
                        ) {
                            const model = TagPage.graphql.hashtag.edge_hashtag_to_media;

                            model.edges = model.edges.map(function(item){
                                item = item.node;
                                item.code = item.shortcode;
                                item.caption = item.edge_media_to_caption.edges.length ? item.edge_media_to_caption.edges[0].node.text : '';
                                item.comment = item.edge_media_to_comment;
                                item.liked_by = item.edge_liked_by;
                                return item
                            });

                            return {
                                count: model.count,
                                nodes: model.edges,
                                edges: model.edges
                            };
                        }
                        else {
                            TagPage.tag.media.edges = TagPage.tag.media.edges || TagPage.tag.media.nodes;
                            return TagPage.tag.media
                        }
                    })(data.entry_data.TagPage[0]);

                    resolve({
                        total: media.count,
                        count: media.nodes.length,
                        media: media.edges
                    });
                } else {
                    reject(new Error('Error scraping tag page "' + tag + '"'));
                }

            })
        ;

    })
};

Instagram.prototype.scrapePostPage = function(code){
    const self = this;

    return new Promise(function(resolve, reject){
        if (!code) return reject(new Error('Argument "code" must be specified'));

        return self._request('post-'+code, postURL + code + '/')
            .then(function(body){
                const data = parse(body);
                if (data) {
                    resolve(data.entry_data.PostPage[0].graphql.shortcode_media);
                } else {
                    reject(new Error('Error scraping post page "' + code + '"'));
                }
            })
        ;
    });
};

Instagram.prototype.scrapeLocationPage = function(id){
    const self = this;

    return new Promise(function(resolve, reject){
        if (!id) return reject(new Error('Argument "id" must be specified'));

        return self._request('loc-'+id, locURL + id + '/')
            .then(function(body){
                const data = parse(body);
                if (data) {
                    resolve(data.entry_data.LocationsPage[0].location);
                } else {
                    reject(new Error('Error scraping location page "' + id + '"'));
                }
            })
        ;
    });
};


module.exports = Instagram;

