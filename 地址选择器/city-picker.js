/* 修改为远程异步获取行政区划数据*/

+ function ($) {
    "use strict";

    var defaults;
    var raw = [];
    $.cityPicker = {
        isReady: false,  //行政区划数据状态
        taskContainer: [] //任务容器
    };

    //构造行政区划数据结构
    $.cityPicker.makexzqh = function (resData) {
        var newData = [];
        var temp1 = [];
        var temp2 = [];
        //省级
        for (var i = 0; i < resData.length; i++) {
            if (resData[i].pcode == "") {
                newData.push({ name: resData[i].name, code: resData[i].code, pcode: resData[i].pcode, sub: [] });
            }
        }
        //市级
        for (var i = 0; i < resData.length; i++) {
            if (resData[i].pcode != "" && resData[i].pcode.substring(2) == "0000") {
                temp1.push({ name: resData[i].name, code: resData[i].code, pcode: resData[i].pcode, sub: [] });
            }
        }
        //县级
        for (var i = 0; i < resData.length; i++) {
            if (resData[i].pcode != "" && resData[i].pcode.substring(2) != "0000") {
                temp2.push({ name: resData[i].name, code: resData[i].code, pcode: resData[i].pcode });
            }
        }
        //将县级添加到市级
        for (var i = 0; i < temp1.length; i++) {
            for (var j = 0; j < temp2.length; j++) {
                if (temp1[i].code == temp2[j].pcode) {
                    temp1[i].sub.push(temp2[j]);
                    temp2.splice(j, 1);
                    j--;
                }
            }
        }
        //将市级添加到省级
        for (var i = 0; i < newData.length; i++) {
            for (var j = 0; j < temp1.length; j++) {
                if (newData[i].code == temp1[j].pcode) {
                    newData[i].sub.push(temp1[j]);
                    temp1.splice(j, 1);
                    j--;
                }
            }
        }
        //console.log(JSON.stringify(newData));
        //console.log(temp1);
        //console.log(temp2);
        return newData;
    }

    var format = function (data) {
        var result = [];
        for (var i = 0; i < data.length; i++) {
            var d = data[i];
            if (/^请选择|市辖区/.test(d.name)) continue;
            result.push(d);
        }
        if (result.length) return result;
        return [];
    };

    var sub = function (data) {
        if (!data.sub) return [{ name: '', code: data.code }];  // 有可能某些县级市没有区
        return format(data.sub);
    };

    var getCities = function (d) {
        for (var i = 0; i < raw.length; i++) {
            if (raw[i].code === d || raw[i].name === d) return sub(raw[i]);
        }
        return [];
    };

    var getDistricts = function (p, c) {
        for (var i = 0; i < raw.length; i++) {
            if (raw[i].code === p || raw[i].name === p) {
                for (var j = 0; j < raw[i].sub.length; j++) {
                    if (raw[i].sub[j].code === c || raw[i].sub[j].name === c) {
                        return sub(raw[i].sub[j]);
                    }
                }
            }
        }
    };

    var parseInitValue = function (val) {
        var p = raw[0], c, d;
        var tokens = val.split(' ');
        raw.map(function (t) {
            if (t.name === tokens[0]) p = t;
        });

        p.sub.map(function (t) {
            if (t.name === tokens[1]) c = t;
        })

        //if (tokens[2]) {
        //    c.sub.map(function (t) {
        //        if (t.name === tokens[2]) d = t;
        //    })
        //}

        //允许第三列空值情况
        if (tokens.length > 1) {
            c.sub.map(function (t) {
                if (t.name === tokens[2]) d = t;
            })
        }

        if (d) return [p.code, c.code, d.code];
        return [p.code, c.code];
    }

    $.fn.cityPicker = function (params) {
        params = $.extend({}, defaults, params);
        //判断第一行 是否有 3 列 ，没有则增加一列空值   (picker选择器 若要显示3列 则第一行必须为3列)
        if (!raw[0].sub[0].sub.length) {
            raw[0].sub[0].sub.push({ name: "", code: "", pcode: "" });
        }
        return this.each(function () {
            var self = this;

            var provincesName = raw.map(function (d) {
                return d.name;
            });
            var provincesCode = raw.map(function (d) {
                return d.code;
            });
            var initCities = sub(raw[0]);
            var initCitiesName = initCities.map(function (c) {
                return c.name;
            });
            var initCitiesCode = initCities.map(function (c) {
                return c.code;
            });
            var initDistricts = sub(raw[0].sub[0]);

            var initDistrictsName = initDistricts.map(function (c) {
                return c.name;
            });
            var initDistrictsCode = initDistricts.map(function (c) {
                return c.code;
            });

            var currentProvince = provincesName[0];
            var currentCity = initCitiesName[0];
            var currentDistrict = initDistrictsName[0];

            var cols = [
                {
                    displayValues: provincesName,
                    values: provincesCode,
                    cssClass: "col-province"
                },
                {
                    displayValues: initCitiesName,
                    values: initCitiesCode,
                    cssClass: "col-city"
                }
            ];

            if (params.showDistrict) cols.push({
                values: initDistrictsCode,
                displayValues: initDistrictsName,
                cssClass: "col-district"
            });

            var config = {

                cssClass: "city-picker",
                rotateEffect: false,  //为了性能
                formatValue: function (p, values, displayValues) {
                    return displayValues.join(' ');
                },
                onChange: function (picker, values, displayValues) {
                    var newProvince = picker.cols[0].displayValue;
                    var newCity;
                    if (newProvince !== currentProvince) {
                        var newCities = getCities(newProvince);
                        newCity = newCities[0].name;
                        var newDistricts = getDistricts(newProvince, newCity);
                        picker.cols[1].replaceValues(newCities.map(function (c) {
                            return c.code;
                        }), newCities.map(function (c) {
                            return c.name;
                        }));
                        if (params.showDistrict) picker.cols[2].replaceValues(newDistricts.map(function (d) {
                            return d.code;
                        }), newDistricts.map(function (d) {
                            return d.name;
                        }));
                        currentProvince = newProvince;
                        currentCity = newCity;
                        picker.updateValue();
                        return false; // 因为数据未更新完，所以这里不进行后序的值的处理
                    } else {
                        if (params.showDistrict) {
                            newCity = picker.cols[1].displayValue;
                            if (newCity !== currentCity) {
                                var districts = getDistricts(newProvince, newCity);
                                picker.cols[2].replaceValues(districts.map(function (d) {
                                    return d.code;
                                }), districts.map(function (d) {
                                    return d.name;
                                }));
                                currentCity = newCity;
                                picker.updateValue();
                                return false; // 因为数据未更新完，所以这里不进行后序的值的处理
                            }
                        }
                    }
                    //如果最后一列是空的，那么取倒数第二列
                    var len = (values[values.length - 1] ? values.length - 1 : values.length - 2)
                    $(self).attr('data-code', values[len]);
                    $(self).attr('data-codes', values.join(','));
                    if (params.onChange) {
                        params.onChange.call(self, picker, values, displayValues);
                    }
                },

                cols: cols
            };

            if (!this) return;
            var p = $.extend({}, params, config);
            //计算value
            var val = $(this).val();
            if (!val) val = '北京 东城 ';
            currentProvince = val.split(" ")[0];
            currentCity = val.split(" ")[1];
            currentDistrict = val.split(" ")[2];
            if (val) {
                p.value = parseInitValue(val);
                if (p.value[0]) {
                    var cities = getCities(p.value[0]);
                    p.cols[1].values = cities.map(function (c) {
                        return c.code;
                    });
                    p.cols[1].displayValues = cities.map(function (c) {
                        return c.name;
                    });
                }

                if (p.value[1]) {
                    if (params.showDistrict) {
                        var dis = getDistricts(p.value[0], p.value[1]);
                        p.cols[2].values = dis.map(function (d) {
                            return d.code;
                        });
                        p.cols[2].displayValues = dis.map(function (d) {
                            return d.name;
                        });
                    }
                } else {
                    if (params.showDistrict) {
                        var dis = getDistricts(p.value[0], p.cols[1].values[0]);
                        p.cols[2].values = dis.map(function (d) {
                            return d.code;
                        });
                        p.cols[2].displayValues = dis.map(function (d) {
                            return d.name;
                        });
                    }
                }
            }
            $(this).picker(p);
        });
    };
    $.cityPickerReady = function (params) {
        //先禁止input输入
        if($(params.elem)){$(params.elem).attr("readonly",true)}
        //判断选择器数据是否已准备完成
        if ($.cityPicker.isReady) {
            $(params.elem).cityPicker(params);
        } else {
            //数据未准备完成 先将任务加入任务列表
            $.cityPicker.taskContainer.push(params);
        }
    }

    defaults = $.fn.cityPicker.prototype.defaults = {
        showDistrict: true //是否显示地区选择
    };

    //异步获取数据
    $.ajax({
        url: "https://wjxapi.freexing.org/api/Wxb/get_xzqh_all",
        type: "GET",
        async: true,
        success: function (res) {
            var res = JSON.parse(res);
            if (res.code == 200 && res.data.length > 0) {
                console.log(res.data);
                raw = $.cityPicker.makexzqh(res.data);
                $.cityPicker.isReady = true;
                //判断任务容器是否有任务
                for (var i = 0; $.cityPicker.taskContainer.length; i++) {
                    var elem = $.cityPicker.taskContainer[i].elem;
                    if ($(elem)) {
                        $(elem).cityPicker($.cityPicker.taskContainer[i]);
                    }
                    $.cityPicker.taskContainer.splice(i, 1);
                    i--;
                }

            }
        },
        error: function (e) { console.log(e) }
    });

}($);
