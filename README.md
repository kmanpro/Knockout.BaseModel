**Knockout.BaseModel** is a plugin to use with KnockoutJS and Knockout.Validation and AmplifyJS(optional).

It is a base model to inherit from using prototype in Javascript. It contains all the ajax methods and validation in itself.
It uses AmplifyJS as a default ajax handler otherwise you can override the ko.baseModel.ajax to something else. It just needs to have the same syntax as AmplifyJS.

Example:

```javascript

myApp.MyModel = (function () {
	ko.baseModel.extend(MyModel);

	function MyModel() {
		var model = this;
		this.Id = ko.observable();
		this.Date = ko.observable();
		this.IdWithDate = ko.dependentObservable(function(){
			return model.Id() + " - Date: " + model.Date(); 
		}, model);
		MyModel.__super__.constructor.call(this);
	}

	return MyModel;
})();

```

More documentation to come once I get some more time.