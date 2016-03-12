var cheerio = require('cheerio'),
    request = require('request');

var THUNDERURL = 'http://www.vipfenxiang.com/xunlei/',
    IQIYIURL = 'http://www.vipfenxiang.com/iqiyi/',
    YOUKUURL = 'http://www.vipfenxiang.com/youku/';

var REGEXP = /([0-9a-z_-]+:[1-9])[^0-9]+([0-9]+)/,
    REGEXP2 = /([a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+)[^a-zA-Z0-9_-]+([a-zA-Z0-9_-]+)/; // 匹配Email 和 密码


module.exports = function getAccountList(type, callback) {
    if (type == 'iqiyi') {
        var URL = IQIYIURL;
        REGEXP = REGEXP2;
    } else if (type == 'youku') {
        var URL = YOUKUURL;
        REGEXP = REGEXP2;
    } else
        var URL = THUNDERURL;

    request(URL, function(err, res, body) {
        if (err) return callback(err);
        var $ = cheerio.load(body);
        var url = $('.content>article.excerpt').first().find('a').attr('href');
        request(url, function(err, res, body) {
            if (err) return callback(err);
            $item = cheerio.load(body);
            var accounts = [];
            $item('article.article-content p').each(function() {
                var text = $item(this).text().trim();
                if (text.match(REGEXP)) {
                    accounts = accounts.concat(text.split('\n').map(format));
                }
            });
            callback(null, accounts);
        });
    });
}

module.exports.REGEXP = REGEXP;

function format(str) {
    var obj = {};
    var match = str.match(REGEXP);
    obj.user = match[1].trim();
    obj.password = match[2].trim();
    return obj;
}
