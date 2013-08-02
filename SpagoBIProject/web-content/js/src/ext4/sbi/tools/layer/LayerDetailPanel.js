/** SpagoBI, the Open Source Business Intelligence suite
 * Copyright (C) 2012 Engineering Ingegneria Informatica S.p.A. - SpagoBI Competency Center
 * This Source Code Form is subject to the terms of the Mozilla Public License, v. 2.0, without the "Incompatible With Secondary Licenses" notice. 
 * If a copy of the MPL was not distributed with this file, You can obtain one at http://mozilla.org/MPL/2.0/. **/

/**
 * 
 *  @author
 *  Alberto Ghedin (alberto.ghedin@eng.it)
 */
 
  
Ext.define('Sbi.tools.layer.LayerDetailPanel', {
    extend: 'Ext.form.Panel'

    ,config: {
    	//frame: true,
    	bodyPadding: '5 5 0',
    	defaults: {
            width: 500
        },        
        fieldDefaults: {
            labelAlign: 'right',
            msgTarget: 'side',
            labelWidth : 150,
            anchor: '100%'
        },
        border: false,
        services:[]
    }

	, constructor: function(config) {
		this.initConfig(config);
		var items = this.initFields();
		this.items=items;
		
		this.addEvents('save');
		this.tbar = Sbi.widget.toolbar.StaticToolbarBuilder.buildToolbar({items:[{name:'->'},{name:'save'}]},this);
		this.tbar.on("save",function(){
			if(this.validateForm()){
				this.fireEvent("save", this.getValues());
			}else{
				Sbi.exception.ExceptionHandler.showErrorMessage(LN('sbi.tools.layer.validation.error'),LN('sbi.generic.validationError'));
			}
			
		},this);
		this.callParent(arguments);
		this.on("render",function(){this.hide()},this);
    }

	, initFields: function(){
				
		

		
		this.layerId = Ext.create("Ext.form.field.Hidden",{
			name: "id"
		});
		this.layerLabel = Ext.create("Ext.form.field.Text",{
			name: "label",
			fieldLabel: LN('sbi.generic.label'),
			allowBlank: false
		});
		
		this.layerName = Ext.create("Ext.form.field.Text",{
			name: "name",
			fieldLabel: LN('sbi.generic.name'),
			allowBlank: false
		});
		
		this.layerDescription = Ext.create("Ext.form.field.TextArea",{
			name: "descr",
			fieldLabel: LN('sbi.generic.descr')
		});
		
    	Ext.define("LayerTypeModel", {
    		extend: 'Ext.data.Model',
            fields: ["VALUE_NM","VALUE_DS","VALUE_ID"]
    	});
    	
    	var layerStore=  Ext.create('Ext.data.Store',{
    		model: "LayerTypeModel",
    		proxy: {
    			type: 'ajax',
    			extraParams : {DOMAIN_TYPE:"LAYER_TYPE"},
    			url:  this.services['getTypes'],
    			reader: {
    				type:"json"
    			}
    		}
    	});
    	layerStore.load();
		this.layerType = new Ext.create('Ext.form.ComboBox', {
			fieldLabel: LN('sbi.generic.type'),
	        store: layerStore,
	        name: "type",
	        displayField:'VALUE_NM',
	        valueField:'VALUE_NM',
	        allowBlank: false,
	        editable: false
	    });
		
		this.layerType.on("change", function(field, newValue, oldValue, eOpts){
			var descr = field.rawValue; 
			this.propertiesDetails.show();
			if(descr=="File"){
				this.propsFile.show();
				this.propsUrl.hide();
			}else if(descr=="Wfs"){
				this.propsUrl.show();
				this.propsFile.hide();
			}
		},this);
		
		
		var propertiesItems = [];
		this.buildCommonProperties(propertiesItems);
		this.buildFileProperties(propertiesItems);
		this.buildWfsProperties(propertiesItems);

		
		this.topDetails = new Ext.create("Ext.form.FieldSet",{
			items : [this.layerId , this.layerLabel, this.layerName, this.layerDescription, this.layerType],
			border: false,
	        layout: 'anchor'
		});
		
		this.propertiesDetails = new Ext.create("Ext.form.FieldSet",{
			items : propertiesItems,
			border: false,
	        layout: 'anchor'
		});
		
		return [this.topDetails, this.propertiesDetails];
	}
	
	
	, buildCommonProperties: function(props){
		
		this.propsName = Ext.create("Ext.form.field.Text",{
			name: "propsName",
			fieldLabel: LN('sbi.tools.layer.props.name'),
			allowBlank: false
		});
		
		this.propsLabel = Ext.create("Ext.form.field.Text",{
			name: "propsLabel",
			fieldLabel: LN('sbi.tools.layer.props.label'),
			allowBlank: false
		});
		
		this.propsZoom = Ext.create("Ext.form.field.Text",{
			name: "propsZoom",
			fieldLabel: LN('sbi.tools.layer.props.zoom'),
			allowBlank: false
		});
		
		this.propsId = Ext.create("Ext.form.field.Text",{
			name: "propsId",
			fieldLabel: LN('sbi.tools.layer.props.id'),
			allowBlank: false
		});
		
		this.propsCentralPoint = Ext.create("Ext.form.field.Text",{
			name: "propsCentralPoint",
			fieldLabel: LN('sbi.tools.layer.props.central.point'),
			allowBlank: false
		});
		
		props.push(this.propsName);
		props.push(this.propsLabel);
		props.push(this.propsZoom);
		props.push(this.propsId);
		props.push(this.propsCentralPoint);
		return props;
		
	}
	
	, buildFileProperties: function(props){
		this.propsFile = Ext.create("Ext.form.field.Text",{
			name: "propsFile",
			fieldLabel: LN('sbi.tools.layer.props.file'),
			hidden: true,
			allowBlank: false
		});
		props.push(this.propsFile);
		return props;
	}
	
	, buildWfsProperties: function(props){
		this.propsUrl = Ext.create("Ext.form.field.Text",{
			name: "propsUrl",
			fieldLabel: LN('sbi.tools.layer.props.url'),
			hidden: true,
			allowBlank: false
		});
		props.push(this.propsUrl);
		return props;
	}
	
	, setFormState: function(values){
		var v = values;
		if(v.type==null || v.type==undefined || v.type==""){
			this.propsUrl.hide();
			this.propsFile.hide();
		}
		this.getForm().setValues(v);
	}
	
	, getValues: function(){
		var values = this.callParent();
		return values;
	}
	
	, validateForm: function(){
		var valid = true;
		var v = this.getValues();

		valid = valid && (v.label!=null && v.label!=undefined &&  v.label!="");
		valid = valid && (v.name!=null && v.name!=undefined &&  v.name!="");
		valid = valid && (v.type!=null && v.type!=undefined &&  v.type!="");
		if(v.type == 'File'){
			valid = valid && (v.propsFile!=null && v.propsFile!=undefined &&  v.propsFile!="");
		}else{
			valid = valid && (v.propsUrl!=null && v.propsUrl!=undefined &&  v.propsUrl!="");
		}
		valid = valid && (v.propsName!=null && v.propsName!=undefined &&  v.propsName!="");
		valid = valid && (v.propsLabel!=null && v.propsLabel!=undefined &&  v.propsLabel!="");
		valid = valid && (v.propsZoom!=null && v.propsZoom!=undefined &&  v.propsZoom!="");
		valid = valid && (v.propsCentralPoint!=null && v.propsCentralPoint!=undefined &&  v.propsCentralPoint!="");
		valid = valid && (v.propsId!=null && v.propsId!=undefined &&  v.propsId!="");
		return valid;
	}
	
});
    