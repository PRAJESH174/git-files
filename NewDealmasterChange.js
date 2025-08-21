function OnLoad(executionContext) {
    try {
        debugger;
        var formContext = executionContext.getFormContext();
        var dealNameAttribute = formContext.getAttribute("jmi_dealname");
        if (dealNameAttribute) {
            dealNameAttribute.addOnChange(NewDealmasterChange);
        }
    } catch (error) {
        console.error(error);
    }
}

function NewDealmasterChange(executionContext) {
    try {
        debugger;
        var formContext = executionContext.getFormContext();
        var DealName = formContext.getAttribute("jmi_dealname").getValue();

        if (DealName != null) {
            var LeadID = DealName[0].id.replace("{", "").replace("}", "");
            Xrm.WebApi.online.retrieveRecord("jmi_dealmaster", LeadID, "?$select=jmi_dealclosedate,jmi_deallaunchdate,jmi_dealmasterid,jmi_dealsize,jmi_dealsource,jmi_dealtype,jmi_fees,jmi_geographiesheadoffice,jmi_geographiesotheroffice,jmi_introductiondate,jmi_investmentamount,_jmi_primarycontact_value,jmi_sector,_jmi_sourcingcompany_value,jmi_subsector,jmi_targetcompanystage,jmi_targetcompanyvaluation")
                .then(
                    function success(result) {
                        debugger;
                        formContext.getAttribute("estimatedclosedate").setValue(new Date(result["jmi_dealclosedate"]));
                        formContext.getAttribute("jmi_deallaunchdate").setValue(new Date(result["jmi_deallaunchdate"]));
                        formContext.getAttribute("jmi_dealsize").setValue(result["jmi_dealsize"]);
                        formContext.getAttribute("jmi_dealsource").setValue(result["jmi_dealsource"]);
                        formContext.getAttribute("jmi_dealtype").setValue(result["jmi_dealtype"]);
                        formContext.getAttribute("jmi_fees").setValue(result["jmi_fees"]);
                        formContext.getAttribute("jmi_geographiesheadoffice").setValue(result["jmi_geographiesheadoffice"]);
                        formContext.getAttribute("jmi_geographiesotheroffice").setValue(result["jmi_geographiesotheroffice"]);
                        formContext.getAttribute("jmi_introductiondate").setValue(new Date(result["jmi_introductiondate"]));
                        formContext.getAttribute("jmi_investmentamount").setValue(result["jmi_investmentamount"]);
                        var contactObj = new Array();
                        contactObj[0] = new Object();
                        contactObj[0].id = result["_jmi_primarycontact_value"];
                        contactObj[0].name = result["_jmi_primarycontact_value@OData.Community.Display.V1.FormattedValue"];;
                        contactObj[0].entityType = result["_jmi_primarycontact_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                        formContext.getAttribute("jmi_primarycontact").setValue(contactObj);
                        formContext.getAttribute("jmi_sector").setValue(result["jmi_sector"]);
                        var sourceCompanyObj = new Array();
                        sourceCompanyObj[0] = new Object();
                        sourceCompanyObj[0].id = result["_jmi_sourcingcompany_value"];
                        sourceCompanyObj[0].name = result["_jmi_sourcingcompany_value@OData.Community.Display.V1.FormattedValue"];
                        sourceCompanyObj[0].entityType = result["_jmi_sourcingcompany_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
                        formContext.getAttribute("jmi_sourcingcompany").setValue(sourceCompanyObj);
                        formContext.getAttribute("jmi_subsector").setValue(result["jmi_subsector"]);
                        formContext.getAttribute("jmi_targetcompanystage").setValue(result["jmi_targetcompanystage"]);
                        formContext.getAttribute("jmi_targetcompanyvaluationm").setValue(result["jmi_targetcompanyvaluation"]);
                      
                    },
                    function (error) {
                        Xrm.Utility.alertDialog(error.message);
                    }
                );
        } else {
            formContext.getAttribute("estimatedclosedate").setValue(null);
            formContext.getAttribute("jmi_deallaunchdate").setValue(null);
            formContext.getAttribute("jmi_investmentamount").setValue(null);
            formContext.getAttribute("jmi_dealsize").setValue(null);
            formContext.getAttribute("jmi_dealsource").setValue(null);
            formContext.getAttribute("jmi_dealtype").setValue(null);
            formContext.getAttribute("jmi_fees").setValue(null);
            formContext.getAttribute("jmi_geographiesheadoffice").setValue(null);
            formContext.getAttribute("jmi_geographiesotheroffice").setValue(null);
            formContext.getAttribute("jmi_introductiondate").setValue(null);
            formContext.getAttribute("jmi_investmentamount").setValue(null);
            formContext.getAttribute("jmi_primarycontact").setValue(null);
            formContext.getAttribute("jmi_sector").setValue(null);
            formContext.getAttribute("jmi_sourcingcompany").setValue(null);
            formContext.getAttribute("jmi_subsector").setValue(null);
            formContext.getAttribute("jmi_targetcompanystage").setValue(null);
            formContext.getAttribute("jmi_targetcompanyvaluationm").setValue(null);
          
        }
    } catch (error) {
        console.error(error);
    }
}
