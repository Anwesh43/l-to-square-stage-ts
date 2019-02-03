const fs = require('fs')
const path = require('path')
const delayInMs = 10000
const cp = require('child_process')

const commandPromise = (command) => {
    return new Promise((resolve, reject) => {
        cp.exec(command, (err, stdout, stderr) => {
            if (err == null) {
                resolve()
            } else {
                reject(err)
            }
        })
    })
}

class FileChecker {
    constructor(filename) {
        this.fn = filename
        this.prevContent = ""
    }

    checkFile() {
        const promise = new Promise((resolve, reject) => {
            try {
                const content = fs.readFileSync(this.fn)
                if (content.toString() != this.prevContent) {
                    resolve(true)
                    this.prevContent = content.toString()
                } else {
                    resolve(false)
                }
            } catch(e) {
                reject(e)
            }
        })
        return promise
    }
}

class FileCheckerLoop {
    constructor(fn, promise) {
        this.fc = new FileChecker(fn)
        this.promise = promise
    }

    start() {
        this.interval = setInterval(() => {
            this.fc.checkFile((changed) => {
                if (changed) {
                    this.promise.then(() => {
                        console.log("done processing on change")
                    }).catch(err=> {
                        console.log(err)
                    })
                }
            })
        }, delayInMs)
    }
}

class FileCommitter {
    constructor(fn) {
        this.number = 0
        this.fn = fn
    }

    checkForChanges() {
        const fcl = new FileCheckerLoop(path.join(__dirname, this.fn), new Promise((resolve, reject) => {
            const commands = ['tsc *.ts', `git add ${this.fn}`, `git commit -m "commit #${this.number++}"`]
            Promise.all(commands.map(commandPromise)).then(() => {
                resolve(true)
            }).catch(err=>reject(err))
        }))
        fcl.start()
    }
}

const fc = new FileCommitter('pert')
fc.checkForChanges()
