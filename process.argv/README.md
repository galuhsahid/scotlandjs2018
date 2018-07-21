# process.argv

process.argv is a property that returns an array containing the command line arguments passed when the Node.js process was launched. The first element is always going to be the absolute pathname of the executable that started the Node.js process, while the second element is the path of the file being executed. The rest are the arguments.

You probably can see that if we try to pass options, the `process.argv` won't recognize it. It will be parsed just like any other string. We can imagine that if we want to process options we'll have to manipulate the strings by ourselves.

One way to make it work is have the first argument as the kind of query we're looking for, artist or song ID. 

But there are some issues here.

First, the only way we can access our arguments is by index. Wouldn't it be nice if we can query our arguments by name, say, artist? Second, we have to handle everything manually by conditionals. Sure it might work if we only have two commands, but what if we have multiple commands like `git`? We have `git init`, `git fetch`, `git branch`  along with all of the possible options.