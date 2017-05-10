const StackApp= require('./stackApp');

module.exports ={
    test1: function(){
        var stack = StackApp.getDefault();
        return new Promise((resolve, reject)=>{
            // var q = stack.ObjectModel['Partner'];
            // q.fetchAll().then((rds)=>{
            //     debugger;
            //     resolve(rds);
            // }).catch((err)=>{reject(err);});
            var q = new stack.ObjectModel['Partner']({id:1});
            q.fetch().then((rds)=>{
                debugger;
                console.log(rds.user__name());
                resolve(rds);
            }).catch((err)=>{reject(err);});
        });
    },
    test: function(){
        var stack = StackApp.getDefault();
        return new Promise((resolve, reject)=>{

        });
    }
};
//insert into public."Partner" values(1,1,1,'dadasd', true, 1, 1000.00, 'as', null, null, null, 1)
