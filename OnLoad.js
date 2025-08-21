function OnLoad(executionContext) {
    try {
        //Get the form context
        var formContext = executionContext.getFormContext();
        //Sample code for On Load Event
        Xrm.Utility.alertDialog("This is an alert for On Load Event.");
    }
    catch (e) {
        Xrm.Utility.alertDialog(e.message);
    }
}
function OnSave(executionContext) {
    try {
        //Get the form context
        var formContext = executionContext.getFormContext();
        //Sample code for On Load Event
        Xrm.Utility.alertDialog("This is an alert for On Save Event.");
    }
    catch (e) {
        Xrm.Utility.alertDialog(e.message);
    }
}

function OnChange(executionContext) {
    try {
        //Get the form context
        var formContext = executionContext.getFormContext();
        //Sample code for On Load Event
        Xrm.Utility.alertDialog("This is an alert for On Change Event.");
    }
    catch (e) {
        Xrm.Utility.alertDialog(e.message);
    }
}

function GetFieldValue(executionContext){
    try {
    //Get the form context
    var formContext = executionContext.getFormContext();
    //Get lookup ID here, Give lookup field logical name here
    var Name = formContext.getAttribute("new_employeeemailid").getValue();
    var Address = formContext.getAttribute("new_address").getValue();

    Xrm.Utility.alertDialog(Name);
    alert(Address);
    }
    catch (e) {
    Xrm.Utility.alertDialog(e.message);
    }
    }
    function SetValue(executionContext) {
        try {
        //Get the form context
        var formContext = executionContext.getFormContext();
        //Set the field value here
        if(formContext.getAttribute("new_employeenumber").getValue()==null || formContext.getAttribute("new_name").getValue()==null ){

            formContext.getAttribute("new_name").setValue("Bharath");
            formContext.getAttribute("new_employeenumber").setValue(45678);

            }
        
        }
        catch (e) {
        Xrm.Utility.alertDialog(e.message);
        }
        }
    function GetLookupId(executionContext){
        try {
        //Get the form context
        var formContext = executionContext.getFormContext();
        //Get lookup ID here, Give lookup field logical name here

        var lookupId = formContext.getAttribute("new_employeeinfo");
        if(lookupId !=null)
        {
            var Id =lookupId.getValue()[0].id;
            var Name =lookupId.getValue()[0].name;
            var EntityName =lookupId.getValue()[0].entityType;
        }
        Xrm.Utility.alertDialog(Id)

;
        Xrm.Utility.alertDialog(Name);
        Xrm.Utility.alertDialog(EntityName);
        }
        catch (e) {
        Xrm.Utility.alertDialog(e.message);
        }
        }

        function SetLookUpFieldValue(executionContext) {
            try {
            //Get the form context
            var formContext = executionContext.getFormContext();
            var SetLookup =formContext.getAttribute("new_employeeinfo");
            if(SetLookup ==null){
            var lookupValue = new Array();
            lookupValue[0]= new Object();
            lookupValue[0].id = "C5602100-4BA1-EC11-B400-000D3A873538";//Guid of the Record to be set
            lookupValue[0].name = "Vinoth"; //Name of the record to be set
            lookupValue[0].entityType = "new_employeeinformation" //Entity Logical Name
            formContext.getAttribute("new_employeeinfodetailsid").setValue(lookupValue);
            }
        }
            catch (e) {
            Xrm.Utility.alertDialog(e.message);
            }
            }

function LockandUnlock(executionContext) {
    try {
        var formContext = executionContext.getFormContext();
        if (formContext.getAttribute("new_category").getValue() == null) {

            formContext.getControl("new_category").setDisabled(true);
        }else{
            formContext.getControl("new_category").setDisabled(false); 
        }
    }
    catch (e) {
        Xrm.Utility.alertDialog(e.message);
    }
}

function ShowandHide(executionContext) {
    try {
        var formContext = executionContext.getFormContext();
        if (formContext.getAttribute("new_ages").getValue() == null) {

            formContext.getControl("new_ages").setVisible(true);
        }
    }
    catch (e) {
        Xrm.Utility.alertDialog(e.message);
    }
}
function SetTheFieldRequirementLevel(executionContext){
    try {
    //Get the form context
    var formContext = executionContext.getFormContext();
    //Set as Business Required
    formContext.getAttribute("new_ages").setRequiredLevel("required");
    //Set as Buiness Recommended
    formContext.getAttribute("new_ages").setRequiredLevel("recommended");
    //Set as Optional
    formContext.getAttribute("new_ages").setRequiredLevel("none");
    }
    catch (e) {
    Xrm.Utility.alertDialog(e.message);
    }
    }

function CreateRecord() {
    try {
        var entityName = "new_employeeinfo"; //Entity Logical Name
        //Data used to Create record
        var data = {
            "new_name": "Tata Consultancy Services",
            "new_employeeid": 123456,
            "new_employeecompany": "ack",
            "new_ages": 10
        }
        Xrm.WebApi.createRecord(entityName, data).then(
            function success(result) {
                Xrm.Utility.alertDialog("Success");
            },
            function (error) {
                Xrm.Utility.alertDialog("Error");
            }
        );
    }
    catch (e) {
        Xrm.Utility.alertDialog(e.message);
    }
}
// Validate Start Date and End Date of Price List.
function ValidateStartDateEndDate(executionContext) {
    var formContext = executionContext.getFormContext();
    var StartDate = formContext.getAttribute("begindate").getValue();
    var EndDate = formContext.getAttribute("enddate").getValue();
    if (StartDate != null && EndDate != null) {
        var startday = new Date(StartDate); 
        var endDay = new Date(EndDate);
        var StartYear = startday.getFullYear();
        var EndYear = endDay.getFullYear();
        if (StartYear != EndYear) {
            alert("Start Date and End Date Must be of Same Year.");
            formContext.getAttribute("enddate").setValue(null);
        }
        if (startday > endDay) {
            alert("End Date Must should be after Start Date.");
            formContext.getAttribute("enddate").setValue(null);
        }
    }
}

function OnLoad(executionContext) {
    try {
        //Get the form context
        var formContext = executionContext.getFormContext();
        //Sample code for On Load Event
        Xrm.Utility.alertDialog("This is an alert for On Load Event.");
    }
    catch (e) {
        Xrm.Utility.alertDialog(e.message);
    }
}
function OnSave(executionContext) {
    try {
        //Get the form context
        var formContext = executionContext.getFormContext();
        //Sample code for On Load Event
        Xrm.Utility.alertDialog("This is an alert for On Save Event.");
    }
    catch (e) {
        Xrm.Utility.alertDialog(e.message);
    }
}

function OnChange(executionContext) {
    try {
        //Get the form context
        var formContext = executionContext.getFormContext();
        //Sample code for On Load Event
        Xrm.Utility.alertDialog("This is an alert for On Change Event.");
    }
    catch (e) {
        Xrm.Utility.alertDialog(e.message);
    }
}

function GetFieldValue(executionContext){
    try {
    //Get the form context
    var formContext = executionContext.getFormContext();
    //Get lookup ID here, Give lookup field logical name here
    var Name = formContext.getAttribute("new_employeeemailid").getValue();
    var Address = formContext.getAttribute("new_address").getValue();

    Xrm.Utility.alertDialog(Name);
    alert(Address);
    }
    catch (e) {
    Xrm.Utility.alertDialog(e.message);
    }
    }
    function SetValue(executionContext) {
        try {
        //Get the form context
        var formContext = executionContext.getFormContext();
        //Set the field value here
        if(formContext.getAttribute("new_employeenumber").getValue()==null || formContext.getAttribute("new_name").getValue()==null ){

            formContext.getAttribute("new_name").setValue("Bharath");
            formContext.getAttribute("new_employeenumber").setValue(45678);

            }
        
        }
        catch (e) {
        Xrm.Utility.alertDialog(e.message);
        }
        }



