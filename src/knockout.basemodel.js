﻿(function () {
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
		var result = new ko.observableArray();
		result.type = type;
		result.createCollection = function (data, callback) {
			var collection, item, obj, _i, _len;
			collection = [];
			for (_i = 0, _len = data.length; _i < _len; _i++) {
				item = data[_i];
				obj = new result.type;
				if (typeof callback === "function") {
					obj.set(callback(item));
				} else {
					obj.set(item);
				}
				collection.push(obj);
			}
			result(collection);
		};
		return result;
	});

	ko.baseModel = (function () {
		var __hasProp = Object.prototype.hasOwnProperty,
		__extends = function (child, parent) {
			for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; }
			function ctor() { this.constructor = child; }
			ctor.prototype = parent.prototype;
			child.prototype = new ctor;
			child.__super__ = parent.prototype;
			return child;
		};

		baseModel.extend = function(child){
			return __extends(child, baseModel);
		};

		baseModel.__defaults = {};
		function baseModel() {
			var i, item, that = this;
			for (i in this) {
				if (!__hasProp.call(this, i)) continue;
				item = this[i];
				this.constructor.__defaults[i] = this.get(i);
			}
			var tryGetName = function(){
				var name = that.constructor.toString().match(/function\s+(\w+) *\(/);
				return (name)? name[1]: '';
			};
			that.constructor.page = that.constructor.page || tryGetName();
			for(var i in that.constructor.webMethods){
				that.constructor.ajax.request.define(that.constructor.page + "_" + i, that.constructor.webMethods[i].serviceType || "ajax", that.constructor.webMethods[i]);
			}

			that.errors = ko.validation.group(that.observablesToValidate())
		}

		baseModel.ajax = amplify;
		
		baseModel.prototype.page = null;
		baseModel.prototype.getModelFromServer = function (params, callback) {
			var that = this;
			that.request("getModelFromServer", params, function (data) {
				that.set(data);
				if (typeof callback === "function") callback(data);
			});
		};

		baseModel.prototype.request = function (webMethodKey, params, callback) {
			var that = this;
			that.constructor.ajax.request(that.constructor.page + "_" + webMethodKey, params, function (data) {
				if (typeof callback === "function") callback(data);
			});
		};

		baseModel.webMethods = {
			getModelFromServer: {url:"getModelFromServer"}
		};
	
		baseModel.prototype.get = function (attr) {
			return ko.utils.unwrapObservable(this[attr]);
		};
	
		baseModel.prototype.observablesToValidate = function(){ return this; }

		baseModel.prototype.errors = null;

		baseModel.prototype.runIfModelValid = function(functionToRun){
			this.errors = ko.validation.group(this.observablesToValidate());
			if(this.errors().length != 0){
				this.errors.showAllMessages();
				return;
			}
			return functionToRun();
		};

		baseModel.prototype.toJS = function(){
			return ko.toJS(this);
		};

		baseModel.prototype.set = function (args) {
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
				else if(obj[i] && obj[i].type && obj[i].createCollection){
					obj[i].createCollection(item);
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

		return baseModel;
	})();
})();