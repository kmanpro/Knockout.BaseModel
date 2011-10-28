(function () {
    if (typeof (ko) === undefined) throw 'Knockout is required, please ensure it is loaded before loading this base model plug-in';
	if (typeof (ko.validation) === undefined) throw 'Knockout.validation is required, please ensure it is loaded before loading this base model plug-in';
	
	ko.utils.unescapeHtml = function (str) {
		var result, temp;
		if (str.length > 0) {
			temp = document.createElement("div");
			temp.innerHTML = str;
			result = temp.childNodes[0].nodeValue;
			temp.removeChild(temp.firstChild);
			return result;
		} else {
			return str;
		}
	};

	ko.knockoutCollection = (function(type){
		this.type = type;
		this.models = ko.observableArray();
		this.createCollection = function (data, callback) {
			var collection, item, obj, _i, _len;
			collection = [];
			for (_i = 0, _len = data.length; _i < _len; _i++) {
				item = data[_i];
				obj = new this.type;
				if (typeof callback === "function") {
					obj.set(callback(item));
				} else {
					obj.set(item);
				}
				collection.push(obj);
			}
			this.models(collection);
		};
	});

	ko.baseKnockoutModel = (function () {
		var __hasProp = Object.prototype.hasOwnProperty,
		__extends = function (child, parent) {
			for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
			function ctor() { this.constructor = child; }
			ctor.prototype = parent.prototype;
			child.prototype = new ctor;
			child.__super__ = parent.prototype;
			return child;
		};

		baseKnockoutModel.extend = function(child){
			return __extends(child, baseKnockoutModel);
		};

		baseKnockoutModel.__defaults = {};
		function baseKnockoutModel() {
			var i, item, that = this;
			for (i in this) {
				if (!__hasProp.call(this, i)) continue;
				item = this[i];
				this.constructor.__defaults[i] = this.get(i);
			}

			for(var i in that.constructor.webMethods){
				that.constructor.ajax.request.define(that.constructor.webMethods[i], that.constructor.webMethodUrl + that.constructor.webMethods[i]);
			}

			that.errors = ko.validation.group(that.observablesToValidate())
		}

		baseKnockoutModel.ajax = amplify;
		
		baseKnockoutModel.prototype.getModelFromServer = function (params, callback) {
			var that = this;
			that.constructor.ajax.request(that.constructor.webMethods.getModelFromServer, params, function (data) {
				that.set(data);
				if (typeof callback === "function") callback(data);
			});
		};

		baseKnockoutModel.webMethodUrl = "SetMe/";
		baseKnockoutModel.webMethods = {
			getModelFromServer: "getModelFromServer"
		};
	
		baseKnockoutModel.prototype.get = function (attr) {
			return ko.utils.unwrapObservable(this[attr]);
		};
	
		baseKnockoutModel.prototype.observablesToValidate = function(){ return this; }

		baseKnockoutModel.prototype.errors = null;

		baseKnockoutModel.prototype.runIfModelValid = function(functionToRun){
			this.errors = ko.validation.group(this.observablesToValidate());
			if(this.errors().length != 0){
				this.errors.showAllMessages();
				return;
			}
			return functionToRun();
		};

		baseKnockoutModel.prototype.toJS = function(){
			return ko.toJS(this);
		};

		baseKnockoutModel.prototype.set = function (args) {
			return setParams(this, args);
		};

		function setParams(obj, args) {
			var i, new_value, item;

			for (i in args) {
				item = args[i];
				var val = ko.utils.unwrapObservable(obj[i]);

				if (typeof item === "string" && item.match(/&[^\s]*;/) !== false) {
					new_value = ko.utils.unescapeHtml(item)
				}
				else if(val instanceof ko.knockoutCollection){
					val.createCollection(item);
					continue;
				}
				else if (typeof item === "object" && typeof val === "object") {
					new_value = setParams(val, item);
				}
				else {
					new_value = item;
				}

				if (ko.isWriteableObservable(obj[i])) {
					if (new_value !== obj[i]()) {
						obj[i](new_value);
					}
				} else if (obj[i] !== void 0 && ko.isObservable(obj[i]) === false) {
					obj[i] = new_value;
				}
			}
			return obj;
		}

		return baseKnockoutModel;
	})();
})();