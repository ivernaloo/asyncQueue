var async = require("async"),
    request = require("request");

var ID = "57e8952c86b5987977928381",
    URL = "http://hr.tuputech.com/recruit/v2/tree",
    TREE = {},
    DICT = {},
    ALPHABET = "abcdefghijklmnopqrstuvwxyz".split("");

Init();

function Init(){
    async.series([
        function(done){
            async.eachSeries(Object.keys(ALPHABET), function(index, next){
                getValue(ALPHABET[index], next)
            }, done);
        },
        function(done){
            request({
                url: URL,
                method: "GET",
                qs: {
                    seed: ID
                },
                useQuerystring: true,
                json: true
            }, function (err, res, body) {
                if ( !err ){
                    TREE = body;
                    done();
                }
            });
        },
        function(done){
            tree(TREE.tree);
            done();
        },
        function(done){
            submit(TREE, done);
        }
    ], function(err){
        if (err) console.error(err.stack);

        console.log('完成URL 列表遍历存储!');
        console.log("Dictionary : ", DICT);
        console.log("TREE : ", JSON.stringify(TREE.tree));
    });
}



// 解析tree
function tree(data){

    Object.keys(data).forEach(function(key, index){
        switch (key){
            case "type":
                data.result = DICT[data[key]].toString();
                delete data[key];
                delete data["level"];
                break;
            case "child":
                // traverse child
                data['child'].forEach(function(key, index){
                    tree(key);
                });
                break;
            default:

        }
    });

}

function getValue(key, callback){
    request({
        method: "POST",
        url: "http://hr.tuputech.com/recruit/tree/" + key,
        json: true
    }, function(err, res, body){
        if (body !== undefined) {
            DICT[key] = body;
        }

        callback();
    })
}

function submit(data, callback){
    request({
        method: "POST",
        url: "http://hr.tuputech.com/recruit/v2/tree/",
        body : {
            treeId : TREE.treeId,
            result : TREE.tree,
            seed : "57e8952c86b5987977928381"
        },
        json: true
    }, function(err, res, body){
        console.log("result : ", body);
        callback();
    })
}