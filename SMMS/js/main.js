/**
 * Resize function without multiple trigger
 * 
 * Usage:
 * $(window).smartresize(function(){  
 *     // code here
 * });
 */
(function ($, sr) {
	// debouncing function from John Hann
	// http://unscriptable.com/index.php/2009/03/20/debouncing-javascript-methods/
	var debounce = function (func, threshold, execAsap) {
		var timeout;

		return function debounced() {
			var obj = this,
				args = arguments;

			function delayed() {
				if (!execAsap)
					func.apply(obj, args);
				timeout = null;
			}

			if (timeout)
				clearTimeout(timeout);
			else if (execAsap)
				func.apply(obj, args);

			timeout = setTimeout(delayed, threshold || 100);
		};
	};

	// smartresize 
	jQuery.fn[sr] = function (fn) {
		return fn ? this.bind('resize', debounce(fn)) : this.trigger(sr);
	};

})(jQuery, 'smartresize');
/**
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var CURRENT_URL = window.location.href.split('#')[0].split('?')[0],
	$BODY = $('body'),
	$MENU_TOGGLE = $('#menu_toggle'),
	$SIDEBAR_MENU = $('#sidebar-menu'),
	$SIDEBAR_FOOTER = $('.sidebar-footer'),
	$LEFT_COL = $('.left_col'),
	$RIGHT_COL = $('.right_col'),
	$NAV_MENU = $('.nav_menu'),
	$FOOTER = $('footer');



// Sidebar
function init_sidebar() {
	// TODO: This is some kind of easy fix, maybe we can improve this
	var setContentHeight = function () {
		// reset height
		$RIGHT_COL.css('min-height', $(window).height());

		var bodyHeight = $BODY.outerHeight(),
			footerHeight = $BODY.hasClass('footer_fixed') ? -10 : $FOOTER.height(),
			leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height(),
			contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;

		// normalize content
		contentHeight -= $NAV_MENU.height() + footerHeight;

		$RIGHT_COL.css('min-height', contentHeight);
	};

	$SIDEBAR_MENU.find('a').on('click', function (ev) {
		console.log('clicked - sidebar_menu');
		var $li = $(this).parent();

		if ($li.is('.active')) {
			$li.removeClass('active active-sm');
			$('ul:first', $li).slideUp(function () {
				setContentHeight();
			});
		} else {
			// prevent closing menu if we are on child menu
			if (!$li.parent().is('.child_menu')) {
				$SIDEBAR_MENU.find('li').removeClass('active active-sm');
				$SIDEBAR_MENU.find('li ul').slideUp();
			} else {
				if ($BODY.is(".nav-sm")) {
					$li.parent().find("li").removeClass("active active-sm");
					$li.parent().find("li ul").slideUp();
				}
			}
			$li.addClass('active');

			$('ul:first', $li).slideDown(function () {
				setContentHeight();
			});
		}
	});

	// toggle small or large menu 
	$MENU_TOGGLE.on('click', function () {
		console.log('clicked - menu toggle');

		if ($BODY.hasClass('nav-md')) {
			$SIDEBAR_MENU.find('li.active ul').hide();
			$SIDEBAR_MENU.find('li.active').addClass('active-sm').removeClass('active');
		} else {
			$SIDEBAR_MENU.find('li.active-sm ul').show();
			$SIDEBAR_MENU.find('li.active-sm').addClass('active').removeClass('active-sm');
		}

		$BODY.toggleClass('nav-md nav-sm');

		setContentHeight();

		$('.dataTable').each(function () {
			$(this).dataTable().fnDraw();
		});
	});

	// check active menu
	$SIDEBAR_MENU.find('a[href="' + CURRENT_URL + '"]').parent('li').addClass('current-page');

	$SIDEBAR_MENU.find('a').filter(function () {
		return this.href == CURRENT_URL;
	}).parent('li').addClass('current-page').parents('ul').slideDown(function () {
		setContentHeight();
	}).parent().addClass('active');

	// recompute content when resizing
	$(window).smartresize(function () {
		setContentHeight();
	});

	setContentHeight();

	// fixed sidebar
	if ($.fn.mCustomScrollbar) {
		$('.menu_fixed').mCustomScrollbar({
			autoHideScrollbar: true,
			theme: 'minimal',
			mouseWheel: {
				preventDefault: true
			}
		});
	}
};
// /Sidebar





// Switchery
$(document).ready(function () {
	if ($(".js-switch")[0]) {
		var elems = Array.prototype.slice.call(document.querySelectorAll('.js-switch'));
		elems.forEach(function (html) {
			var switchery = new Switchery(html, {
				color: '#26B99A'
			});
		});
	}
});


function init_chart_doughnut() {

	if (typeof (Chart) === 'undefined') {
		return;
	}

	console.log('init_chart_doughnut');

	if ($('.canvasDoughnut').length) {

		var chart_doughnut_settings = {
			type: 'doughnut',
			tooltipFillColor: "rgba(51, 51, 51, 0.55)",
			data: {
				labels: [
					"Symbian",
					"Blackberry",
					"Other",
					"Android",
					"IOS"
				],
				datasets: [{
					data: [1, 2, 5, 20, 19],
					backgroundColor: [
						"#BDC3C7",
						"#9B59B6",
						"#E74C3C",
						"#26B99A",
						"#3498DB"
					],
					hoverBackgroundColor: [
						"#CFD4D8",
						"#B370CF",
						"#E95E4F",
						"#36CAAB",
						"#49A9EA"
					]
				}]
			},
			options: {
				legend: false,
				responsive: false
			}
		}

		$('.canvasDoughnut').each(function () {

			var chart_element = $(this);
			var chart_doughnut = new Chart(chart_element, chart_doughnut_settings);

		});

	}

}

function init_gauge() {

	if (typeof (Gauge) === 'undefined') {
		return;
	}

	console.log('init_gauge [' + $('.gauge-chart').length + ']');

	console.log('init_gauge');


	var chart_gauge_settings = {
		lines: 12,
		angle: 0,
		lineWidth: 0.4,
		pointer: {
			length: 0.75,
			strokeWidth: 0.042,
			color: '#1D212A'
		},
		limitMax: 'false',
		colorStart: '#1ABC9C',
		colorStop: '#1ABC9C',
		strokeColor: '#F0F3F3',
		generateGradient: true
	};


	if ($('#chart_gauge_01').length) {

		var chart_gauge_01_elem = document.getElementById('chart_gauge_01');
		var chart_gauge_01 = new Gauge(chart_gauge_01_elem).setOptions(chart_gauge_settings);

	}


	if ($('#gauge-text').length) {

		chart_gauge_01.maxValue = 6000;
		chart_gauge_01.animationSpeed = 32;
		chart_gauge_01.set(3200);
		chart_gauge_01.setTextField(document.getElementById("gauge-text"));

	}

	if ($('#chart_gauge_02').length) {

		var chart_gauge_02_elem = document.getElementById('chart_gauge_02');
		var chart_gauge_02 = new Gauge(chart_gauge_02_elem).setOptions(chart_gauge_settings);

	}


	if ($('#gauge-text2').length) {

		chart_gauge_02.maxValue = 9000;
		chart_gauge_02.animationSpeed = 32;
		chart_gauge_02.set(2400);
		chart_gauge_02.setTextField(document.getElementById("gauge-text2"));

	}


}



/* DATA TABLES */
var table = null;
var slopeInfo = {
	CONT_AG: "",
	SLOPE_NO: "",
	DIVISION: "",
	STATUS: "",
	COMB_TYPE: "",
	DISTRICT: "",
	HEIGHT: "",
	LENGTH: "",
	ANGLE: "",
	MATERIAL: "",
	REG_DATE: "",
	MAINT_AGEN: "",
	SMR_CAT_CD: "",
	SIFT_CLASS: "",
	NPRS: "",
	CAT: "",
	LOCATION: "",
	INP_BY: "",
	LAST_INP_D: "",
	NEXT_INP_D: "",
	PHOTO: "",
	EI_FORM: {
		Item1: "",
		Item2: ""
	},
	EI_RPT: ""
};

//清空数据模型
function clearObj(Obj) {
	if (Array.isArray(Obj)) return [];
	if ($.isEmptyObject(Obj)) return Obj;
	Object.keys(Obj).forEach(key => {
		if (typeof Obj[key] === "object") {
			Obj[key] = clearObj(Obj[key]);
		} else {
			Obj[key] = "";
		}
	});
	return Obj;
}

function init_DataTables() {

	console.log('run_datatables');

	if (typeof ($.fn.DataTable) === 'undefined') {
		return;
	}
	console.log('init_DataTables');

	var handleDataTableButtons = function () {
		if ($("#datatable").length) {
			table = $("#datatable").DataTable({
				ajax: {
					url: "js/slopeInfo2.json",
					dataSrc: ""
				},
				columns: [{
						name: 'checkBox',
						data: null
					},
					{
						name: 'SLOPE_NO',
						data: 'SLOPE_NO'

					},
					{
						name: 'DIVISION',
						data: 'DIVISION'
					},
					{
						name: 'STATUS',
						data: 'STATUS'
					},
					{
						name: 'LOCATION',
						data: 'LOCATION'
					},
					{
						name: 'DISTRICT',
						data: 'DISTRICT'

					},
					{
						name: 'COMB_TYPE',
						data: 'COMB_TYPE'
					},
					{
						visible: false, //隐藏列
						name: 'HEIGHT',
						data: 'HEIGHT'
					},
					{
						visible: false,
						name: 'LENGTH',
						data: 'LENGTH'
					},
					{
						visible: false,
						name: 'ANGLE',
						data: 'ANGLE'
					},
					{
						visible: false,
						name: 'MATERIAL',
						data: 'MATERIAL'
					},
					{
						visible: false,
						name: 'SIFT_CLASS',
						data: 'SIFT_CLASS'
					},
					{
						visible: false,
						name: 'REG_DATE',
						data: 'REG_DATE'
					},
					{
						visible: false,
						name: 'CONT_AG',
						data: 'CONT_AG'
					},
					{
						visible: false,
						name: 'INP_BY',
						data: 'INP_BY'
					},
					{
						name: 'LAST_INP_D',
						data: 'LAST_INP_D'
					},
					{
						name: 'NEXT_INP_D',
						data: 'NEXT_INP_D'
					},
					{
						visible: false,
						name: 'MAINT_AGEN',
						data: 'MAINT_AGEN'
					},
					{
						visible: false,
						name: 'SMR_CAT_CD',
						data: 'SMR_CAT_CD'
					},
					{
						visible: false,
						name: 'PHOTO',
						data: 'PHOTO'
					},
					{
						visible: false,
						name: 'EI_RPT',
						data: 'EI_RPT'
					},
					{
						visible: false,
						name: 'EI_FORM',
						data: 'EI_FORM'
					},
				],
				'order': [
					[1, 'asc']
				],
				'columnDefs': [{
					orderable: false,
					targets: [0] //禁止第一列可排序
				}],

				dom: "Bfrtlip",
				buttons: [{
						className: "btn-primary table-btn",
						text: 'Add',
						action: function (e, dt, node, config) {
							clearObj(slopeInfo); //清空数据模型
							$('#detailModal #detailModalLabel').text('ADD SLOPE');
							$('#detailModal fieldset').attr('disabled', false);
							$('#detailModal #commit').attr("data-type", "add").hide();
							$('#detailModal #save').show();
							$('#detailModal').modal('show');
						}
					},
					{
						className: "btn-primary table-btn",
						text: 'Edit',
						action: function (e, dt, node, config) {
							//判断是否有选中行
							var sCount = $("table tr.selected").length;

							if (!sCount) {
								bootbox.alert({
									message: "Please select the row you want to edit !",
									// size: 'small'
								});
								return false;
							}
							if (sCount > 1) {
								bootbox.alert({
									message: "Only one row can be edited at a time, too many rows have been selected !",
								});
								return false;
							}
							var data = table.row($("table tr.selected")[0]).data();
							//如果数据状态为已审核则不能编辑
							if (data.STATUS == 3) {
								bootbox.alert({
									message: "Data has been approved and cannot be edited !",
								});
								return false;
							}

							
								

							$.extend(slopeInfo, data);
							//设置检查日期为系统当前日期
							slopeInfo.NEXT_INP_D = (new Date()).toLocaleDateString();

							$('#detailModal #detailModalLabel').text('EDIT');
							$($('#detailModal fieldset')[0]).attr('disabled', true);
							$('#detailModal #commit').attr("data-type", "edit").show();
							$('#detailModal #save').show();

							$('#detailModal').modal('show');
						}
					},
					{
						className: "btn-primary table-btn",
						text: 'Delete',
						action: function (e, dt, node, config) {
							//判断是否有选中行
							var sCount = $("table tr.selected").length;
							if (!sCount) {
								bootbox.alert({
									message: "Please select the row to delete !",
									size: 'small'
								});
								return false;
							}
							bootbox.confirm({
								title: "Delete Slope?",
								message: "Do you want to delete the slope now? This cannot be undone.",
								buttons: {
									cancel: {
										label: '<i class="fa fa-times"></i> Cancel'
									},
									confirm: {
										label: '<i class="fa fa-check"></i> Confirm'
									}
								},
								callback: function (result) {
									if (result) {
										$("table tr.selected").each(function (tr) {
											table.row($("table tr.selected")[tr]).remove();
										})
										table.draw();
										// table.ajax.reload() //刷新数据
									}

								}
							});


						}
					},
					{
						extend: "excel",
						className: "btn-primary table-btn",
						text: 'Export',
						exportOptions: {
							'columns': '1,4,5,6,7,8,9,10,11,12' //根据列序号选择指定列
						}
					},

					{
						extend: "print",
						className: "btn-primary table-btn",
						text: 'Print',
						// message:'description message', //打印描述信息
						exportOptions: { //从DataTable中选择要收集的数据。这包括列、行、排序和搜索的选项。options选项参见：https://datatables.net/reference/api/buttons.exportData()
							// 'format': { //用于导出将使用的单元格格式化函数的容器对象 format有三个子标签，header，body和foot
							// 	header: function ( data, row, column, node ) { //body区域的function，可以操作需要导出excel的数据格式
							// 		if(row == 0  || row == 2  || row == 3){
							// 			return "";
							// 		}
							// 		else{
							// 			return data;
							// 		}
							// 	},
							// 	body: function ( data, row, column, node ) { //body区域的function，可以操作需要导出excel的数据格式
							// 		if(row == 0  || row == 2  || row == 3){
							// 			return "";
							// 		}
							// 		else{
							// 			return data;
							// 		}
							// 	}
							// },
							// 'columns': 'SLOPE_NO:name,MAP:name'   //根据列名选择指定列
							'columns': '1,4,5,6,7,8,9,10,11,12' //根据列序号选择指定列
						}

					},
				],

				aLengthMenu: [10, 25, 50], //设置每页显示条数
				// responsive: true,
				// fixedHeader: true,
				// "createdRow":function(){
				// },
				"rowCallback": function (row, data, index) {
					//add checkbox
					$('td', row).eq(0).html('<input type="checkbox" class="flat" name="table_records">');
					//format status
					var status = "";
					switch (data['STATUS']) {
						case "1":
							status = "pending inspection";
							break;
						case "2":
							status = "submitted";
							break;
						case "3":
							status = "approved";
							break;
					}
					$('td', row).eq(3).html(status);
					//format MAp clounm
					// var showMap = data['MAP'] == "" ? "None" : "<a href='" + data['MAP'] + "' target='_blank' onclick='javascript:event.stopPropagation();'>show</a>";
					// $('td', row).eq(2).html(showMap);
					// //format PHOTO clounm
					// var showPhoto = data['PHOTO'] == "" ? "None" : "<a href='#' data-imgUrls = " + data['PHOTO'] + " onclick='showPhoto(this);'>show</a>";
					// $('td', row).eq(3).html(showPhoto);
				}
			});
		}
	};
	// // iCheck
	$("#datatable").on('draw.dt', function () {
		$('table input.flat').iCheck({
			checkboxClass: 'icheckbox_flat-green',
			radioClass: 'iradio_flat-green'
		});

		// Table
		$('table input[type="checkbox"]').on('ifChecked', function () {
			checkState = '';
			$(this).parent().parent().parent().addClass('selected');
			countChecked();
		});
		$('table input[type="checkbox"]').on('ifUnchecked', function () {
			checkState = '';
			$(this).parent().parent().parent().removeClass('selected');
			countChecked();
		});

		var checkState = '';

		$('table input#check-all').on('ifChecked', function () {
			checkState = 'all';
			countChecked();
		});
		$('table input#check-all').on('ifUnchecked', function () {
			checkState = 'none';
			countChecked();
		});

		function countChecked() {
			if (checkState === 'all') {
				$("table input[name='table_records']").iCheck('check');
			}
			if (checkState === 'none') {
				$("table input[name='table_records']").iCheck('uncheck');
			}
		}
	});



	//绑定列表行单击事件，显示详情信息
	$('#datatable tbody').on('click', 'tr', function () {
		var data = table.row(this).data();
		$.extend(slopeInfo, data);

		$('#detailModal #detailModalLabel').text('DETAIL');
		$('#detailModal fieldset').attr('disabled', true);
		$('#detailModal #commit').hide();
		$('#detailModal #save').hide();

		$('#detailModal').modal('show');
	});
	//初始化vue实例
	if ($("#detailModal").length) {
		myVue = new Vue({
			el: '#detailModal',
			data: slopeInfo
		})
	}
	//添加状态值格式化过滤器
	Vue.filter("statusFormat", function (value) {
		var status = "";
		switch (value.toString()) {
			case "1":
				status = "pending inspection";
				break;
			case "2":
				status = "submitted";
				break;
			case "3":
				status = "approved";
				break;
		}
		return status;
	});

	//初始化日期选择器
	$('#REG_DATE,#LAST_INP_D').datetimepicker({
		format: 'yyyy/mm/dd', //显示格式
		weekStart: 1,
		todayBtn: 1,
		autoclose: 1,
		todayHighlight: 1,
		startView: 2,
		minView: 2,
		forceParse: 0
	});
	//隐藏日期控件的同时绑定数据
	$("#REG_DATE,#LAST_INP_D").datetimepicker().on('hide', function (ev) {
		var id = ev.currentTarget.id;
		var DATE = $("#" + id).val();
		myVue.$set(myVue, id, DATE);
	});


	//表单提交事件
	$('#detailModal #commit').on('click', function () {
		if ($(this).attr("data-type") == "add") {
			table.row.add(slopeInfo).draw();
			$('#detailModal').modal('hide');
		}
		if ($(this).attr("data-type") == "edit") {
			table.row($("table tr.selected")[0]).data(slopeInfo).draw();
			$("table tr.selected input").iCheck('check');
			$('#detailModal').modal('hide');
		}
	});



	TableManageButtons = function () {
		"use strict";
		return {
			init: function () {
				handleDataTableButtons();
			}
		};
	}();

	TableManageButtons.init();
}


$(document).ready(function () {
	init_sidebar();
	init_DataTables();
	init_chart_doughnut();
	init_gauge();
});