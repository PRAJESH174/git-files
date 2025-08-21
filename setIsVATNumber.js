function setIsVATNumber(executionContext){
    debugger;
    var formContext = executionContext.getFormContext(); 
    var account=formContext.getAttribute("parentaccountid").getValue();
    if(account!=null){
    Xrm.WebApi.online.retrieveRecord("account", account[0].replace("{", "").replace("}", ""), "?$select=new_vatnumber").then(
        function success(result) {
            var vatnumber = result["new_vatnumber"];
            if(vatnumber!=null){
                formContext.getAttribute("new_isvatnumberavailable").setValue(true);
            }
            else{
                formContext.getAttribute("new_isvatnumberavailable").setValue(false);
            }
        },
        function(error) {
            Xrm.Utility.alertDialog(error.message);
        }
    );
    }
}