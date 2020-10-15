sap.ui.define([
		"sap/ui/core/format/NumberFormat"
	],
	function (NumberFormat) {
		"use strict";
		return {
			
			
			formatTextTienda : function(sTienda, oTiendas){
				
				if(!sTienda){
					return "";
				}
				return sTienda + " - " + oTiendas[sTienda];
			},
			
			formatEnabledEditFechaInicio: function (sInicio) {

				var fnToDate = function (sDate) {
					var sDay = sDate.substring(6, 8),
						sMonth = sDate.substring(4, 6),
						sYear = sDate.substring(0, 4);
					return new Date(sYear, sMonth - 1, sDay).setHours(0,0,0);
				};
				
				if(fnToDate(sInicio) >= new Date().setHours(0,0,0)){
					return true;
				} else {
					return false;
				}

			},
			
			formatEnabledEditFechaInicioText : function(sInicio){
				
				var fnToDate = function (sDate) {
					var sDay = sDate.substring(6, 8),
						sMonth = sDate.substring(4, 6),
						sYear = sDate.substring(0, 4);
					return new Date(sYear, sMonth - 1, sDay).setHours(0,0,0);
				};
				
				if(fnToDate(sInicio) >= new Date().setHours(0,0,0)){
					return false;
				} else {
					return true;
				}
				
			},
			
			
			formatEnabledEditFechaFin: function (sFin) {

				var fnToDate = function (sDate) {
					var sDay = sDate.substring(6, 8),
						sMonth = sDate.substring(4, 6),
						sYear = sDate.substring(0, 4);
					return new Date(sYear, sMonth - 1, sDay).setHours(0,0,0);
				};
				
				if(fnToDate(sFin) >= new Date().setHours(0,0,0)){
					return true;
				} else {
					return false;
				}

			},
			
			formatEnabledEditFechaFinText: function (sFin) {

				var fnToDate = function (sDate) {
					var sDay = sDate.substring(6, 8),
						sMonth = sDate.substring(4, 6),
						sYear = sDate.substring(0, 4);
					return new Date(sYear, sMonth - 1, sDay).setHours(0,0,0);
				};
				
				if(fnToDate(sFin) >= new Date().setHours(0,0,0)){
					return false;
				} else {
					return true;
				}

			},

			showInfoError: function (sArticulo, aErrores) {

				if (!aErrores) {
					return "";
				}
				if (aErrores.length === 0) {
					return "";
				}
				var sArticulo = sArticulo;
				var aMyErrors = aErrores.filter(function (oError) {
					return oError.Message.indexOf(sArticulo) >= 0;
				}, this);
				if (aMyErrors.length === 0) {
					return "";
				}
				return aMyErrors[0].Message;
			},

			showInfoStateError: function (sArticulo, aErrores) {

				if (!aErrores) {
					return "Success";
				}
				if (aErrores.length === 0) {
					return "Success";
				}
				var sArticulo = sArticulo;
				var aMyErrors = aErrores.filter(function (oError) {
					return oError.Message.indexOf(sArticulo) >= 0;
				}, this);
				if (aMyErrors.length === 0) {
					return "Success";
				}
				var bError = aMyErrors[0].Type === "E";
				var bWarning = aMyErrors[0].Type === "W";
				if (bError) {
					return "Error";
				}
				if (bWarning) {
					return "Warning";
				}
			},

			colorSemaforoGeneral: function (oRow, aErrores) {

				if (oRow) {

					if (!aErrores) {
						return "grey";
					}
					var sArticulo = oRow.Matnr;
					var aMyErrors = aErrores.filter(function (oError) {
						return oError.Message.indexOf(sArticulo) >= 0;
					}, this);
					if (aMyErrors.length === 0) {
						return "green";
					}
					var bError = aMyErrors.some(function (oError) {
						return oError.Type === "E";
					});
					var bWarning = aMyErrors.some(function (oError) {
						return oError.Type === "W";
					});
					if (bWarning === true && bError === false) {
						return "orange";
					}
					return bError ? "red" : "green";
				}
				return "green";
			},

			srcSemaforoGeneral: function (oRow, aErrores) {

				if (oRow) {

					if (!aErrores) {
						return "sap-icon://question-mark";
					}
					var sArticulo = oRow.Matnr;
					var aMyErrors = aErrores.filter(function (oError) {
						return oError.Message.indexOf(sArticulo) >= 0;
					}, this);
					if (aMyErrors.length === 0) {
						return "sap-icon://message-success";
					}
					var bError = aMyErrors.some(function (oError) {
						return oError.Type === "E";
					});
					var bWarning = aMyErrors.some(function (oError) {
						return oError.Type === "W";
					});

					if (bWarning === true && bError === false) {
						return "sap-icon://message-warning";
					}
					return bError ? "sap-icon://message-error" : "sap-icon://message-success";
				}
				return "green";
			},

			formatTipoColeccion: function (sTipoColeccion) {
				var sDescripcion = "";

				switch (sTipoColeccion) {
				case "A":
					sDescripcion = "General";
					break;

				case "P":
					sDescripcion = "Peculiar";
					break;

				case "T":
					sDescripcion = "Traspaso";
					break;
				case "E":
					sDescripcion = "Excluído";
					break;
				}

				return sDescripcion;
			},

			visibleNoAnidado: function (sTipoColeccion) {
				if (sTipoColeccion === "" || sTipoColeccion === "A") {
					return false;
				}

				return true;
			},

			visibleAnidado: function (sTipoColeccion) {
				if (sTipoColeccion === "A") {
					return true;
				}

				return false;
			},

			crearDescripcionColec: function (sTipoColeccion, sTienda, sTituloAnidado) {
				var sDescripcion = "";
				switch (sTipoColeccion) {
				case "A":
					sDescripcion = sTituloAnidado;
					break;

				case "P":
					sDescripcion = "SURT PECULIAR " + sTienda;
					break;

				case "T":
					sDescripcion = "TRASPASO_" + sTienda;
					break;
				case "E":
					sDescripcion = "EXC_USU_" + sTienda;
					break;
				}
				return sDescripcion;
			},

			visibileNoAnidado: function (sTipoColeccion) {
				var sDescripcion = "";
				switch (sTipoColeccion) {
				case "A":
					return true;
					break;
				default:
					return false;
				}
			},

			convertStringToDateString: function (sDate) {
				if (!sDate) {
					return "";
				}

				var dateString = sDate;
				var year = dateString.substring(0, 4);
				var month = dateString.substring(4, 6);
				var day = dateString.substring(6, 8);

				return day + "." + month + "." + year;
			},

			convertBooleanToString: function (bValue) {
				if (bValue) {
					return "X";
				} else {
					return "";
				}
			},

			articulosCount: function (aItems) {
				if (aItems) {
					return "Articulos (" + aItems.length + ")";
				} else {
					return "Articulos (0)";
				}
			},

			tiendasCount: function (aItems) {
				if (aItems) {
					return "Tiendas (" + aItems.length + ")";
				} else {
					return "Tiendas (0)";
				}
			},

			formatDateShowTwo: function (sInicio, sFin) {

				if (sInicio && sInicio != "") {

					var fnChange = function (sDate) {
						var sDay = sDate.substring(6, 8),
							sMonth = sDate.substring(4, 6),
							sYear = sDate.substring(0, 4);
						return sDay + "." + sMonth + "." + sYear;
					}
					return fnChange(sInicio) + " - " + fnChange(sFin);
				}
			},

			formatDateShow: function (sInicio) {

				if (sInicio && sInicio != "") {

					var fnChange = function (sDate) {
						var sDay = sDate.substring(6, 8),
							sMonth = sDate.substring(4, 6),
							sYear = sDate.substring(0, 4);
						return sDay + "." + sMonth + "." + sYear;
					}
					return fnChange(sInicio);
				}
			}

		};
	});