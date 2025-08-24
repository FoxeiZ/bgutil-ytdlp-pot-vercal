let fs = require('fs'),
    uuid = (a) => (a ? (a ^ ((Math.random() * 16) >> (a / 4))).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, uuid)),
    /* may be made asynchronous */
    rm = id => fs.unlinkSync(path.join(dir, id + '.txt')),
    dir = '/tmp/',
    path = require('path');

/*writes/reads data as text/plain, open to modifications*/
module.exports = {
    read: id => new Promise((resolve, reject) => fs.readFile(dir + id + '.txt', (err, buffer) => {
        if (err) reject(err);
        else resolve(buffer.toString())
    })
    ),
    write: function (data, cb, id) {
        fs.writeFile(dir + (id = uuid()) + '.txt', data, _ => cb(id))
    },
    rm
}