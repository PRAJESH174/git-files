function openFormPop(){
    var entityFormOptions = {};
    entityFormOptions["entityName"] = "new_networking";
    entityFormOptions["openInNewWindow"] = true;
    entityFormOptions["height"] = 100;
 
// Open the form.
Xrm.Navigation.openForm(entityFormOptions).then(
    function (success) {
        console.log(success);
    },
    function (error) {
        console.log(error);
    });
}