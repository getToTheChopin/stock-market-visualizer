var dateArray = [];
var vtPriceArray = [];
var vfinxPriceArray = [];
var xiuPriceArray = [];
var vbmfxPriceArray = [];

var vtDivArray = [];
var vfinxDivArray = [];
var xiuDivArray = [];
var vbmfxDivArray = [];

var vtAdjPriceArray = [];
var vfinxAdjPriceArray = [];
var xiuAdjPriceArray = [];
var vbmfxAdjPriceArray = [];

var dateArrayPartial = [];
var vtPriceArrayPartial = [];
var vfinxPriceArrayPartial = [];
var xiuPriceArrayPartial = [];
var vbmfxPriceArrayPartial = [];

var chart;
var chart2;
var chart3;

var pointRadius = 1;
var pointHoverRadius = 3;

var indexSelection = document.getElementById("indexSelection");
var timePeriodSelection = document.getElementById("timePeriodSelection");
var customTimePeriodSelectionDiv = document.getElementById("customTimePeriodSelectionDiv");
customTimePeriodSelectionDiv.style.display = "none";

var chartTitleString;

var errorMessageDiv = document.getElementById("errorMessageDiv");
errorMessageDiv.style.display = "none";
var errorMessage = document.getElementById("errorMessage");

var selectedIndexArray = [];

var startPriceOutput = document.getElementById("startPriceOutput");
var endPriceOutput = document.getElementById("endPriceOutput");
var priceChangeOutput = document.getElementById("priceChangeOutput");
var returnOutput = document.getElementById("returnOutput");
var timePeriodOutput = document.getElementById("timePeriodOutput");
var annualizedReturnOutput = document.getElementById("annualizedReturnOutput");

var startPriceLabel = document.getElementById("startPriceLabel");
var endPriceLabel = document.getElementById("endPriceLabel");

var chartColor = "black";

var tickSpacing = 1;

var startYear = document.getElementById("startYear");
var startMonth = document.getElementById("startMonth");
var startDay = document.getElementById("startDay");

var endYear = document.getElementById("endYear");
var endMonth = document.getElementById("endMonth");
var endDay = document.getElementById("endDay");

var startDate = new Date();
var endDate = new Date();

var minDate = new Date(1980,0,2);
var daysInSelectedPeriod = 0;
var daysFromMinDate = 0;

var vtMinDate = new Date(2008,5,26);
var vfinxMinDate = new Date(1980,0,2);
var xiuMinDate = new Date(1999,9,4);
var vbmfxMinDate = new Date(1986,11,11);

var dailyReturnArray = [];
var dailyReturnCountArray = [0,0,0,0,0,0,0,0,0,0,0,0];
var dailyReturnProportionArray = [0,0,0,0,0,0,0,0,0,0,0,0];
var dailyReturnLabelArray = [];
var nonZeroReturnCount = 0;

var loadingAnimationDiv = document.getElementById("loadingAnimationDiv");

var dividendCheckBox = document.getElementById("dividendCheckBox");

var annualReturnsChartText = document.getElementById("annualReturnsChartText");
var annualReturns = [];
var annualReturnLabels  = [];
var annualReturnBackgroundColours = [];

var upYearsOutput = document.getElementById("upYearsOutput");
var downYearsOutput = document.getElementById("downYearsOutput");
var totalYearsOutput = document.getElementById("totalYearsOutput");

var upYearCount = 0;
var downYearCount = 0;

var upDaysOutput = document.getElementById("upDaysOutput");
var downDaysOutput = document.getElementById("downDaysOutput");
var totalDaysOutput = document.getElementById("totalDaysOutput");
var upDaysReturnOutput = document.getElementById("upDaysReturnOutput");
var downDaysReturnOutput = document.getElementById("downDaysReturnOutput");
var totalDaysReturnOutput = document.getElementById("totalDaysReturnOutput");
var bestDayOutput = document.getElementById("bestDayOutput");
var worstDayOutput = document.getElementById("worstDayOutput");

var upDayCount = 0;
var downDayCount = 0;
var bestDayValue;
var bestDayDate;
var worstDayValue;
var worstDayDate;

var upDailyReturnArray = [];
var downDailyReturnArray = [];

var medianUpReturn = 0;
var medianDownReturn = 0;
var medianAllReturn = 0;


//Access google sheet spreadsheet using tabletop
var publicSpreadsheetUrl = 'https://docs.google.com/spreadsheets/d/1b0mE5utEux3XKM9RGrffRHlER6_O6C9WbWUb7AZjZ_0/edit?usp=sharing';

//main method
chooseChartTitle();
addInputEventListeners();
init();

function init() {
    Tabletop.init( {
        key: publicSpreadsheetUrl,
        callback: showInfo,
        simpleSheet: true,
        debug:true
    })
}

//Turn JSON from Tabletop into arrays -- generate full arrays
function showInfo(data, tabletop) {

    //generate full arrays pulled from the master google sheets spreadsheet
    for (i=0;i<data.length;i++) {
        dateArray[i] = String(data[i].Date);
        vtPriceArray[i] = Number(data[i].VT);
        vfinxPriceArray[i] = Number(data[i].VFINX);
        xiuPriceArray[i] = Number(data[i].XIU);
        vbmfxPriceArray[i] = Number(data[i].VBMFX);

        vtDivArray[i] = Number(data[i].VTDiv);
        vfinxDivArray[i] = Number(data[i].VFINXDiv);
        xiuDivArray[i] = Number(data[i].XIUDiv);
        vbmfxDivArray[i] = Number(data[i].VBMFXDiv);
    }

    // create arrays of dividend adjusted prices
    calculateDividendAdjustments();

    runCharts();

    //remove loading animation once data is loaded from google sheets
    loadingAnimationDiv.style.display="none";
}

function addInputEventListeners() {
    var inputsArray = document.getElementsByClassName("userInput");
    console.log("# of event listeners: "+inputsArray.length);

    for(i=0;i<inputsArray.length;i++) {
        inputsArray[i].addEventListener('change',refreshChart, false);
    }
}

function refreshChart(){
    console.log("refresh chart");
    chart.destroy();
    chart2.destroy();
    chart3.destroy();
    chooseChartTitle();
    runCharts();
}

function chooseChartTitle(){
    if(indexSelection.value == "VT") {  
        chartTitleString = "Global Stocks (FTSE Global All Cap) -- VT";
    } else if(indexSelection.value == "VFINX"){
        chartTitleString = "U.S. Stocks (S&P500) -- VFINX";
    } else if(indexSelection.value == "XIU"){
        chartTitleString = "Canadian Stocks (TSX60) -- XIU";
    } else {
        chartTitleString = "U.S. Bonds (Govt and Corp) -- VBMFX"; 
    }
}

function runCharts() {

    console.log("Chart Title: "+chartTitleString);

    errorMessageDiv.style.display = "none";

    //set dates based on user selection
    setDates();

    //error check on user selected dates
    checkDates();

    //generate arrays based on user selected date -- use either dividend adjusted or not as well
    generatePartialArrays(daysFromMinDate,daysInSelectedPeriod);

    //select index based on user selection and set chart title
    console.log(indexSelection.value);

    if(indexSelection.value == "VT") {  
        selectedIndexArray = vtPriceArrayPartial.slice();
        chartColor = "#cf00a7";
    } else if(indexSelection.value == "VFINX"){
        selectedIndexArray = vfinxPriceArrayPartial.slice();
        chartColor = "#0070b4";
    } else if(indexSelection.value == "XIU"){
        selectedIndexArray = xiuPriceArrayPartial.slice();
        chartColor = "#ff6c4d";
    } else {
        selectedIndexArray = vbmfxPriceArrayPartial.slice();
        chartColor = "#32dc95";
        //32dc95
        //3cffae
    }
    
    //calculate daily returns
    calculateDailyReturns();

    //calculate annual returns
    calculateAnnualReturns();

    //conditional formatting for price chart based on selected time period length
    if(dateArrayPartial.length >= 365*30){
        tickSpacing = 365*2;
        pointHoverRadius = 3;
        pointRadius = 1;       
    } else if(dateArrayPartial.length >= 365*12) {
        tickSpacing = 365;
        pointHoverRadius = 3;
        pointRadius = 1;
    } else if(dateArrayPartial.length >= 365*8) {
        tickSpacing = 180;
        pointHoverRadius = 3;
        pointRadius = 1;
    } else if(dateArrayPartial.length >= 365*2) {
        tickSpacing = 90;
        pointHoverRadius = 3;
        pointRadius = 1;        
    } else if(dateArrayPartial.length >= 365) {
        tickSpacing = 30;
        pointHoverRadius = 3;
        pointRadius = 1;
    } else if(dateArrayPartial.length >=200) {
        tickSpacing = 14;
        pointHoverRadius = 3;
        pointRadius = 1;        
    } else if(dateArrayPartial.length >= 30){
        tickSpacing = 7;
        pointHoverRadius = 5;
        pointRadius = 2;
    } else {
        tickSpacing = 1;
        pointHoverRadius = 7;
        pointRadius = 4;
    }

    //draw price chart with chart.js
    var ctx = document.getElementById('priceChart').getContext('2d');

    chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',
    
        // The data for our dataset
        data: {
            labels: dateArrayPartial,
            datasets: [
                {
                    label: "Price",
                    borderColor: chartColor,
                    pointBackgroundColor: chartColor,
                    fill: false,
                    data: selectedIndexArray,
                    pointHitRadius: pointHoverRadius,
                    radius: pointRadius,
                    lineTension: 0,
                },                
            ]
        },
    
        // Configuration options go here
        options: {

            maintainAspectRatio: false,
        
            tooltips: {
                
                // Include a dollar sign in the ticks and add comma formatting
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';

                        if (label) {
                            label += ': ';
                        }
                        label += '$'+tooltipItem.yLabel.toLocaleString();
                        return label;
                    }
                },
            },

            scales: {
                yAxes: [{
                    ticks: {
                        // Include a dollar sign in the ticks and add comma formatting
                        callback: function(value, index, values) {
                            return '$' + value.toFixed(2);
                        },

                        fontColor: "rgb(56,56,56)",
                    },

                    scaleLabel: {
                        display: true,
                        labelString: "Price",
                        fontColor: "rgb(56,56,56)",
                        fontStyle: "bold",
                        fontSize: 15,
                    },

                    gridLines: {
                        drawTicks: false,
                        zeroLineColor: "rgb(56,56,56)",
                        zeroLineWidth: 2,
                    },
                }],

                xAxes: [{
                    ticks: {
                        userCallback: function(item, index) {
                            if (!(index % tickSpacing)) return item;
                        },
                        autoSkip: false,
                        fontColor: "rgb(56,56,56)",

                        maxRotation: 90,
                        minRotation: 90, 
                    },

                    scaleLabel: {
                        display: true,
                        labelString: "Date",
                        fontColor: "rgb(56,56,56)",
                        fontStyle: "bold",
                        fontSize: 15,
                    },

                    gridLines: {
                        drawTicks: false,
                        zeroLineColor: "rgb(56,56,56)",
                        zeroLineWidth: 2,
                    },
                }],    
            },

            legend: {
                labels: {
                    fontColor: "rgb(56,56,56)",
                    boxWidth: 13,
                    padding: 10,
                },
            },

            title: {
                display: true,
                text: chartTitleString,
                fontSize: 18,
                fontColor: "rgb(56,56,56)",
                padding: 2,
            },

        }
    });


    //custom colours for bar chart
    var barColorPlugin = {
        // We affect the `beforeUpdate` event
        beforeUpdate: function(chart) {
            
            //only apply the bar color formatting for the annual return chart
            if(chart.config.options.plugin_one_attribute) {

            }

            //only apply the bar color formatting for the daily return chart
            if(chart.config.options.plugin_two_attribute) {
                var backgroundColor = [];

                //fill negative return bars with red colour, green bar for positive
                backgroundColor[0] = "#C20000";
                backgroundColor[1] = "#C20000";
                backgroundColor[2] = "#C20000";
                backgroundColor[3] = "#C20000";
                backgroundColor[4] = "#C20000";
                backgroundColor[5] = "#C20000";
                backgroundColor[6] = "#00b457";
                backgroundColor[7] = "#00b457";
                backgroundColor[8] = "#00b457";
                backgroundColor[9] = "#00b457";
                backgroundColor[10] = "#00b457";
                backgroundColor[11] = "#00b457";
               
                // We update the chart bars color properties
                chart.config.data.datasets[0].backgroundColor = backgroundColor;
            }
        }
    };

    var annualTickSpacing = 1;

    if(annualReturns.length>=15){
        annualTickSpacing = 2;
    } else {
        annualTickSpacing = 1;
    }

    console.log("Annual Tick Spacing: "+annualTickSpacing);

    // We now register the plugin to the chart's plugin service to activate it
    Chart.pluginService.register(barColorPlugin);

    //draw annual return chart with chart.js
    var ctx2 = document.getElementById('annualReturnsChart').getContext('2d');

    chart2 = new Chart(ctx2, {
        // The type of chart we want to create
        type: 'bar',
    
        // The data for our dataset
        data: {
            labels: annualReturnLabels,
            datasets: [
                {
                    label: "Annual % Return",
                    data: annualReturns,
                    backgroundColor: annualReturnBackgroundColours, 
                },                
            ]
        },
    
        //options for annual returns chart.js bar chart
        options: annualReturnsBarChartOptions = {

            plugin_one_attribute: 1,
            maintainAspectRatio: false,

            tooltips: {
                // Include a dollar sign in the ticks and add comma formatting
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';

                        if (label) {
                            label += ': ';
                        }
                        label += (tooltipItem.yLabel*100).toFixed(1) + "%";
                        return label;
                    }
                },
            },
            
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "Annual Return %",
                        fontColor: "rgb(56,56,56)",
                        fontStyle: "bold",
                        fontSize: 15,
                    },

                    ticks: {
                        callback: function(value, index, values) {
                            return (value*100).toFixed(1)+"%";
                        },

                        fontColor: "rgb(56,56,56)",
                    },

                    gridLines: {
                        zeroLineColor: "rgb(56,56,56)",
                        zeroLineWidth: 2,
                    },
                }],

                xAxes: [{
                    
                    ticks: {

                        userCallback: function(item, index) {
                            if (!(index % annualTickSpacing)) return item;
                        },
                        autoSkip: false,

                        maxRotation:90,
                        minRotation:90,
                    },

                    scaleLabel: {
                        display: true,
                        labelString: "Year",
                        fontColor: "rgb(56,56,56)",
                        fontStyle: "bold",
                        fontSize: 15,
                    },

                    gridLines: {
                        zeroLineColor: "rgb(56,56,56)",
                        zeroLineWidth: 2,
                    },
                }],    
            },

            legend: {
                labels: {
                    fontColor: "rgb(56,56,56)",
                    boxWidth: 13,
                    padding: 10,
                },
            },

            title: {
                display: true,
                text: chartTitleString,
                fontSize: 18,
                fontColor: "rgb(56,56,56)",
                padding: 2,
            },
        }
    });

    //draw daily distribution chart with chart.js
    var ctx3 = document.getElementById('dailyDistributionChart').getContext('2d');

    chart3 = new Chart(ctx3, {
        // The type of chart we want to create
        type: 'bar',
    
        // The data for our dataset
        data: {
            labels: dailyReturnLabelArray,
            datasets: [
                {
                    label: "% Share of Daily Returns",
                    data: dailyReturnProportionArray,
                    backgroundColor: "black", 
                },                
            ]
        },
    
        // options for daily distribution chart.js bar chart
        options: dailyReturnBarChartOptions = {
        
            plugin_two_attribute: 1,
            maintainAspectRatio: false,
        
            
            tooltips: {
                // Include a dollar sign in the ticks and add comma formatting
                callbacks: {
                    label: function(tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';
        
                        if (label) {
                            label += ': ';
                        }
                        label += (tooltipItem.yLabel*100).toFixed(1) + "%";
                        return label;
                    }
                },
            },
            
            
            scales: {
                yAxes: [{
                    scaleLabel: {
                        display: true,
                        labelString: "% Share of Daily Returns",
                        fontColor: "rgb(56,56,56)",
                        fontStyle: "bold",
                        fontSize: 15,
                    },
        
                    ticks: {
                        callback: function(value, index, values) {
                            return (value*100).toFixed(1)+"%";
                        },
        
                        fontColor: "rgb(56,56,56)",
                    },
        
                    gridLines: {
                        zeroLineColor: "rgb(56,56,56)",
                        zeroLineWidth: 2,
                    },
                }],
        
                xAxes: [{
                    ticks: {
                        maxRotation: 90,
                        minRotation: 90, 
                    },
        
                    scaleLabel: {
                        display: true,
                        labelString: "Daily Return",
                        fontColor: "rgb(56,56,56)",
                        fontStyle: "bold",
                        fontSize: 15,
                    },
        
                    gridLines: {
                        zeroLineColor: "rgb(56,56,56)",
                        zeroLineWidth: 2,
                    },
                }],    
            },
        
            legend: {
                labels: {
                    fontColor: "rgb(56,56,56)",
                    boxWidth: 13,
                    padding: 10,
                },
            },
        
            title: {
                display: true,
                text: chartTitleString,
                fontSize: 18,
                fontColor: "rgb(56,56,56)",
                padding: 2,
            },
        }
        
    });

    //fill out page output metrics based on user selections
    displayOutputs();

    console.log(selectedIndexArray);
}

function treatAsUTC(date) {
    var result = new Date(date);
    result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
    return result;
}

//Round up days between two dates
function daysBetween(startDateBetween, endDateBetween) {
    var millisecondsPerDay = 24 * 60 * 60 * 1000;
    return Math.floor(((treatAsUTC(endDateBetween) - treatAsUTC(startDateBetween)) / millisecondsPerDay));
}

//generate partial arrays from the full date / price arrays, based on user selection of dates
function generatePartialArrays (partialStateDate,partialEndDate) {
    
    //reset the partial arrays to be blank
    dateArrayPartial = [];
    vtPriceArrayPartial = [];
    vfinxPriceArrayPartial = [];
    xiuPriceArrayPartial = [];
    vbmfxPriceArrayPartial = [];

    //either grab unadjusted prices or dividend adjusted prices based on user selection
    if(dividendCheckBox.checked) {
        console.log("dividend box is checked");

        for(i=0; i<=partialEndDate; i++){
            dateArrayPartial[i] = dateArray[partialStateDate + i];
            vtPriceArrayPartial[i] = vtAdjPriceArray[partialStateDate + i];
            vfinxPriceArrayPartial[i] = vfinxAdjPriceArray[partialStateDate + i];
            xiuPriceArrayPartial[i] = xiuAdjPriceArray[partialStateDate + i];
            vbmfxPriceArrayPartial[i] = vbmfxAdjPriceArray[partialStateDate + i];
        }
    } else {
        console.log("dividend box is NOT checked");

        for(i=0; i<=partialEndDate; i++){
            dateArrayPartial[i] = dateArray[partialStateDate + i];
            vtPriceArrayPartial[i] = vtPriceArray[partialStateDate + i];
            vfinxPriceArrayPartial[i] = vfinxPriceArray[partialStateDate + i];
            xiuPriceArrayPartial[i] = xiuPriceArray[partialStateDate + i];
            vbmfxPriceArrayPartial[i] = vbmfxPriceArray[partialStateDate + i];
        }
    }
}

function checkDates() {

    if(startDate > endDate) {
        errorMessageDiv.style.display = "block";
        errorMessage.innerHTML = "The start date that you've entered is AFTER the end date. Please adjust!";
    }

    if(endDate > new Date()) {
        errorMessageDiv.style.display = "block";
        errorMessage.innerHTML = "The end date that you've entered is in the future. The end date has been automatically adjusted back to today.";
        var today = new Date();
        endDay.value = today.getDate();
        endMonth.value = today.getMonth()+1;
        endYear.value = today.getFullYear();
        setDates();
    }

    if(indexSelection.value == "VT"){
        if(startDate < vtMinDate) {
            startYear.value = 2008;
            startMonth.value = 6;
            startDay.value = 26;
            errorMessageDiv.style.display = "block";
            errorMessage.innerHTML = "The data for VT only goes back to June 26, 2008. The start date has been automatically adjusted.";
            setDates();
        }
    }

    if(indexSelection.value == "VFINX"){
        if(startDate < vfinxMinDate) {
            startYear.value = 1980;
            startMonth.value = 1;
            startDay.value = 2;
            errorMessageDiv.style.display = "block";
            errorMessage.innerHTML = "The data for VFINX only goes back to January 2, 1980. The start date has been automatically adjusted.";
            setDates();
        }
    }

    if(indexSelection.value == "XIU"){
        if(startDate < xiuMinDate) {
            startYear.value = 1999;
            startMonth.value = 10;
            startDay.value = 4;
            errorMessageDiv.style.display = "block";
            errorMessage.innerHTML = "The data for XIU only goes back to October 4, 1999. The start date has been automatically adjusted.";
            setDates();
        }
    }

    if(indexSelection.value == "VBMFX"){
        if(startDate < vbmfxMinDate) {
            startYear.value = 1986;
            startMonth.value = 12;
            startDay.value = 11;
            errorMessageDiv.style.display = "block";
            errorMessage.innerHTML = "The data for VBMFX only goes back to December 11, 1986. The start date has been automatically adjusted.";
            setDates();
        }
    }
}

function displayOutputs() {

    var startPrice = selectedIndexArray[0];
    var endPrice = selectedIndexArray[selectedIndexArray.length-1];
    var priceReturn = Math.round((endPrice - startPrice) * 100) / 100;
    var percentReturn = Math.round(priceReturn / startPrice * 100 * 10) / 10;

    startPriceLabel.innerHTML = "Starting Price ("+dateArrayPartial[0]+")";
    endPriceLabel.innerHTML = "Ending Price ("+dateArrayPartial[dateArrayPartial.length-1]+")";

    annualReturnsChartText.innerHTML = "The chart above shows returns for each calendar year from "+dateArrayPartial[0]+" to "+dateArrayPartial[dateArrayPartial.length-1]+". Partial years are shown where applicable.";

    startPriceOutput.innerHTML = "$"+startPrice.toFixed(2);
    endPriceOutput.innerHTML = "$"+endPrice.toFixed(2);

    if(daysInSelectedPeriod+1 == 1) {
        timePeriodOutput.innerHTML = "1 day";
    } else if(daysInSelectedPeriod+1 < 365) {
        timePeriodOutput.innerHTML = daysInSelectedPeriod+1 + " days";
    } else if(daysInSelectedPeriod+1 < 396) {
        timePeriodOutput.innerHTML = "1.0 year";
    } else {
        timePeriodOutput.innerHTML = (Math.round((daysInSelectedPeriod+1)/365*10)/10).toFixed(1) + " years";
    }

    if(priceReturn >= 0) {
        priceChangeOutput.innerHTML = "+$"+priceReturn.toFixed(2);
        returnOutput.innerHTML = "+"+percentReturn.toFixed(1)+"%";
        
        priceChangeOutput.style.color = "#00b457";
        returnOutput.style.color = "#00b457";
    } else {
        priceChangeOutput.innerHTML = "($"+Math.abs(priceReturn).toFixed(2)+")";
        returnOutput.innerHTML = "("+Math.abs(percentReturn).toFixed(1)+"%)";
        
        priceChangeOutput.style.color = "red";
        returnOutput.style.color = "red";
    }

    if(daysInSelectedPeriod >= 365) {
        if(priceReturn >= 0) {
            annualizedReturnOutput.innerHTML = "+"+(Math.round((Math.pow((1+priceReturn/startPrice),(1/((daysInSelectedPeriod)/365))) - 1) * 100 * 10) / 10).toFixed(1) + "%";
            annualizedReturnOutput.style.fontStyle = "normal";
            annualizedReturnOutput.style.color = "#00b457";
        } else {
            annualizedReturnOutput.innerHTML = "(" + (Math.abs(Math.round((Math.pow((1+priceReturn/startPrice),(1/((daysInSelectedPeriod)/365))) - 1) * 100 * 10) / 10)).toFixed(1) + "%)";
            annualizedReturnOutput.style.fontStyle = "normal";
            annualizedReturnOutput.style.color = "red";
        }
    } else {
        annualizedReturnOutput.innerHTML = "n/a (less than one year)";
        annualizedReturnOutput.style.fontStyle = "italic";
        annualizedReturnOutput.style.color = "#838383";
    }

    upYearsOutput.innerHTML = upYearCount.toLocaleString() + " (" + ((upYearCount/(upYearCount+downYearCount))*100).toFixed(1)+"%)";
    downYearsOutput.innerHTML = downYearCount.toLocaleString() + " (" + ((downYearCount/(upYearCount+downYearCount))*100).toFixed(1)+"%)";
    totalYearsOutput.innerHTML = (upYearCount + downYearCount).toLocaleString();
   
    upDaysOutput.innerHTML = upDayCount.toLocaleString() + " (" + ((upDayCount/(upDayCount+downDayCount))*100).toFixed(1)+"%)";
    downDaysOutput.innerHTML = downDayCount.toLocaleString() + " (" + ((downDayCount/(upDayCount+downDayCount))*100).toFixed(1)+"%)";
    totalDaysOutput.innerHTML = (upDayCount + downDayCount).toLocaleString();

    medianUpReturn = median(upDailyReturnArray);
    medianDownReturn = median(downDailyReturnArray);
    medianAllReturn = median(upDailyReturnArray.concat(downDailyReturnArray));

    console.log("Up return array length: "+upDailyReturnArray.length);
    console.log("Down return array length: "+downDailyReturnArray.length);
    console.log("All daily return array length: "+upDailyReturnArray.concat(downDailyReturnArray).length);

    upDaysReturnOutput.innerHTML = (medianUpReturn*100).toFixed(2)+"%";
    downDaysReturnOutput.innerHTML = (medianDownReturn*100).toFixed(2)+"%";
    totalDaysReturnOutput.innerHTML = (medianAllReturn*100).toFixed(2)+"%";

    bestDayOutput.innerHTML = (bestDayValue*100).toFixed(1)+"%" + " on " + bestDayDate;
    worstDayOutput.innerHTML = (worstDayValue*100).toFixed(1)+"%" + " on " + worstDayDate;
}

//set start and end date inputs based on user selection
function setDates() {
    
    customTimePeriodSelectionDiv.style.display = "none";

    if(timePeriodSelection.value == "sevenDays"){
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 7);  
    } else if(timePeriodSelection.value == "thirtyDays"){
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 30);   
    } else if(timePeriodSelection.value == "yearToDate"){
        endDate = new Date();
        startDate = new Date(endDate.getFullYear()-1,11,31);
    } else if(timePeriodSelection.value == "oneYear"){
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 365);     
    } else if(timePeriodSelection.value == "twoYears"){
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 365*2);    
    } else if(timePeriodSelection.value == "threeYears"){
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 365*3);
    } else if(timePeriodSelection.value == "fiveYears"){
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 365*5);
    } else if(timePeriodSelection.value == "tenYears"){
        endDate = new Date();
        startDate = new Date();
        startDate.setDate(endDate.getDate() - 365*10);
    } else if(timePeriodSelection.value == "max"){
        if(indexSelection.value == "VT"){
            endDate = new Date();
            startDate = vtMinDate;
        }
    
        if(indexSelection.value == "VFINX"){
            endDate = new Date();
            startDate = vfinxMinDate;
        }
    
        if(indexSelection.value == "XIU"){
            endDate = new Date();
            startDate = xiuMinDate;        
        }

        if(indexSelection.value == "VBMFX"){
            endDate = new Date();
            startDate = vbmfxMinDate;        
        }

    } else {
        console.log("no other date conditions met -- use custom");
        startDate = new Date(startYear.value,startMonth.value-1,startDay.value);
        endDate = new Date(endYear.value,endMonth.value-1,endDay.value);
        customTimePeriodSelectionDiv.style.display = "block";
    }

    //calc days between start / end of user selection, and days from the oldest data
    daysInSelectedPeriod =  daysBetween(startDate, endDate);
    daysFromMinDate = daysBetween(minDate,startDate);

    console.log(startDate);
    console.log(endDate);
    console.log(minDate);
    
    console.log(daysInSelectedPeriod);
    console.log(daysFromMinDate);

}

//converts raw date format into YYYY-MM-DD format
//not used anymore in this code
function convertDate(rawDate) {
    var dd = rawDate.getDate();
    var mm = rawDate.getMonth()+1; //January is 0!
    var yyyy = rawDate.getFullYear();

    if(dd<10) {
        dd = '0'+dd;
    } 

    if(mm<10) {
        mm = '0'+mm;
    }

    var outputDate = yyyy + '-' + mm + '-' + dd;
    return outputDate;
}


//take user selected price array and calculate daily returns
function calculateDailyReturns() {
    
    //default back to 0
    dailyReturnArray = [];
    dailyReturnCountArray = [0,0,0,0,0,0,0,0,0,0,0,0];
    dailyReturnProportionArray = [0,0,0,0,0,0,0,0,0,0,0,0];
    nonZeroReturnCount = 0;
    upDayCount = 0;
    downDayCount = 0;
    upDailyReturnArray = [];
    downDailyReturnArray = [];

    //x-axis bucket labels for chart
    dailyReturnLabelArray = ["<(5.0%)","(5.0%) to (4.0%)","(4.0%) to (3.0%)","(3.0%) to (2.0%)",
    "(2.0%) to (1.0%)","(1.0%) to 0.0%","0.0% to +1.0%","+1.0% to +2.0%","+2.0% to +3.0%",
    "+3.0% to +4.0%","+4.0% to +5.0%",">+5.0%"]

    for(i=0; i<selectedIndexArray.length-1;i++) {
        var currentPrice = selectedIndexArray[i];
        var nextPrice = selectedIndexArray[i+1];
        var dailyReturn = nextPrice / currentPrice - 1;
        dailyReturnArray[i] = dailyReturn;
        
        if(dailyReturn == 0) {


        } else {
            nonZeroReturnCount = nonZeroReturnCount+1;
        
            //count up and down return days for output on page
            if(dailyReturn >0){
                upDayCount++;
                upDailyReturnArray.push(dailyReturn);
            } else{
                downDayCount++;
                downDailyReturnArray.push(dailyReturn);
            }
        }

        //figure out which bucket of returns this one falls into, and increment the count accordingly
        if(dailyReturn < -0.05) {
            dailyReturnCountArray[0] ++;
        } else if(dailyReturn >= -0.05 && dailyReturn <-0.04){
            dailyReturnCountArray[1] ++;
        } else if(dailyReturn >= -0.04 && dailyReturn <-0.03){
            dailyReturnCountArray[2] ++;
        } else if(dailyReturn >= -0.03 && dailyReturn <-0.02){
            dailyReturnCountArray[3] ++;
        } else if(dailyReturn >= -0.02 && dailyReturn <-0.01){
            dailyReturnCountArray[4] ++;
        } else if(dailyReturn >= -0.01 && dailyReturn <0){
            dailyReturnCountArray[5] ++;
        } else if(dailyReturn > 0 && dailyReturn <=0.01){
            dailyReturnCountArray[6] ++;
        } else if(dailyReturn > 0.01 && dailyReturn <=0.02){
            dailyReturnCountArray[7] ++;
        } else if(dailyReturn > 0.02 && dailyReturn <=0.03){
            dailyReturnCountArray[8] ++;
        } else if(dailyReturn > 0.03 && dailyReturn <=0.04){
            dailyReturnCountArray[9] ++;
        } else if(dailyReturn > 0.04 && dailyReturn <=0.05){
            dailyReturnCountArray[10] ++;
        } else if(dailyReturn > 0.05){
            dailyReturnCountArray[11] ++;
        }

        //find best and worst day
        //set first day as both best and worst day to initialize
        if(i==0){
            bestDayDate = dateArrayPartial[i+1];
            bestDayValue = dailyReturn;
            worstDayDate = dateArrayPartial[i+1];
            worstDayValue = dailyReturn;
        } else{
            if(dailyReturn > bestDayValue){
                bestDayDate = dateArrayPartial[i+1];
                bestDayValue = dailyReturn;
            } else if(dailyReturn < worstDayValue){
                worstDayDate = dateArrayPartial[i+1];
                worstDayValue = dailyReturn;             
            } else{
                //do nothing, this isn't a best or worst day
            }
        }
    }


    //calculate % proportion of returns in each bucket
    for(i=0; i<dailyReturnCountArray.length; i++) {
        dailyReturnProportionArray[i] = dailyReturnCountArray[i] / nonZeroReturnCount;
    }

}

//create arrays of prices with dividends reinvested
function calculateDividendAdjustments() {
    for(i=0; i<dateArray.length; i++){
 
        if(i==0){
            vtAdjPriceArray[i] = vtPriceArray[i];
            vfinxAdjPriceArray[i] = vfinxPriceArray[i];
            xiuAdjPriceArray[i] = xiuPriceArray[i];
            vbmfxAdjPriceArray[i] = vbmfxPriceArray[i];
        } else {
            
            //VT
            if(isNaN(vtAdjPriceArray[i-1])) {
                vtAdjPriceArray[i] = vtPriceArray[i];  
            } else if(isNaN(vtPriceArray[i-1]) || isNaN(vtPriceArray[i]) || isNaN(vtDivArray[i])) {
                //take previous adj value if there is an error in the adjusted data (e.g., null)
                vtAdjPriceArray[i] = vtAdjPriceArray[i-1]; 
            } else {
                //previous value + unadjusted daily return + dividend (if any)
                vtAdjPriceArray[i] = vtAdjPriceArray[i-1] * (vtPriceArray[i] / vtPriceArray[i-1]) + (vtDivArray[i] / vtPriceArray[i-1] * vtAdjPriceArray[i-1]);
            }

            //VFINX
            if(isNaN(vfinxAdjPriceArray[i-1])) {
                vfinxAdjPriceArray[i] = vfinxPriceArray[i];  
            } else if(isNaN(vfinxPriceArray[i-1]) || isNaN(vfinxPriceArray[i]) || isNaN(vfinxDivArray[i])) {
                //take previous adj value if there is an error in the adjusted data (e.g., null)
                vfinxAdjPriceArray[i] = vfinxAdjPriceArray[i-1]; 
            } else {
                //previous value + unadjusted daily return + dividend (if any)
                vfinxAdjPriceArray[i] = vfinxAdjPriceArray[i-1] * (vfinxPriceArray[i] / vfinxPriceArray[i-1]) + (vfinxDivArray[i] / vfinxPriceArray[i-1] * vfinxAdjPriceArray[i-1]);
            }

            //XIU
            if(isNaN(xiuAdjPriceArray[i-1])) {
                xiuAdjPriceArray[i] = xiuPriceArray[i];  
            } else if(isNaN(xiuPriceArray[i-1]) || isNaN(xiuPriceArray[i]) || isNaN(xiuDivArray[i])) {
                //take previous adj value if there is an error in the adjusted data (e.g., null)
                xiuAdjPriceArray[i] = xiuAdjPriceArray[i-1]; 
            } else {
                //previous value + unadjusted daily return + dividend (if any)
                xiuAdjPriceArray[i] = xiuAdjPriceArray[i-1] * (xiuPriceArray[i] / xiuPriceArray[i-1]) + (xiuDivArray[i] / xiuPriceArray[i-1] * xiuAdjPriceArray[i-1]);
            }

            //VBMFX
            if(isNaN(vbmfxAdjPriceArray[i-1])) {
                vbmfxAdjPriceArray[i] = vbmfxPriceArray[i];  
            } else if(isNaN(vbmfxPriceArray[i-1]) || isNaN(vbmfxPriceArray[i]) || isNaN(vbmfxDivArray[i])) {
                //take previous adj value if there is an error in the adjusted data (e.g., null)
                vbmfxAdjPriceArray[i] = vbmfxAdjPriceArray[i-1]; 
            } else {
                //previous value + unadjusted daily return + dividend (if any)
                vbmfxAdjPriceArray[i] = vbmfxAdjPriceArray[i-1] * (vbmfxPriceArray[i] / vbmfxPriceArray[i-1]) + (vbmfxDivArray[i] / vbmfxPriceArray[i-1] * vbmfxAdjPriceArray[i-1]);
            }
        
        }
    }
}

//go through the # of years selected by user, pick out first and last price from selected array, calc return and save in array
function calculateAnnualReturns(){
    
    //initialize blank values
    annualReturns = [];
    annualReturnLabels  = [];
    upYearCount = 0;
    downYearCount = 0;
    
    var firstReturnDate = new Date(startDate);
    firstReturnDate.setDate(firstReturnDate.getDate() + 1);
    var lastReturnDate = new Date(endDate);

    var firstReturnYear = firstReturnDate.getFullYear();
    var lastReturnYear = lastReturnDate.getFullYear();

    var numYears = lastReturnYear - firstReturnYear + 1;

    console.log("First return date: "+firstReturnDate);
    console.log("Last return date: "+lastReturnDate);
    console.log("# of years to output: "+numYears);

    for(i=0;i<numYears;i++) {

        var currentYearStartDate;
        var currentYearEndDate;

        var currentYearStartPrice;
        var currentYearEndPrice;
        var currentYearReturn;

        var currentDaysFromMinDate = 0;
        var currentDaysInPeriod = 0;

        
        if(i==0 && numYears ==1){
            currentYearStartDate = new Date(startDate);
            currentYearEndDate = new Date(endDate);
        } else if(i==0){
            currentYearStartDate = new Date(startDate);
            currentYearEndDate = new Date(firstReturnYear,11,31);
        } else if (i == numYears-1){
            currentYearStartDate = new Date(lastReturnYear-1,11,31);
            currentYearEndDate = new Date(endDate);
        } else {
            currentYearStartDate = new Date(firstReturnYear+i-1,11,31);
            currentYearEndDate = new Date(firstReturnYear+i,11,31);
        }

        currentDaysFromMinDate = daysBetween(minDate,currentYearStartDate);
        currentDaysInPeriod = daysBetween(currentYearStartDate,currentYearEndDate);

        currentYearStartPrice = selectedIndexArray[currentDaysFromMinDate-daysFromMinDate];
        currentYearEndPrice = selectedIndexArray[currentDaysFromMinDate-daysFromMinDate+currentDaysInPeriod];
        currentYearReturn = currentYearEndPrice / currentYearStartPrice - 1;
        
        //save outputs for chart
        annualReturns[i] = currentYearReturn;

        if(currentYearReturn >=0){
            annualReturnBackgroundColours[i] = "#00b457";
            upYearCount++;
        } else{
            annualReturnBackgroundColours[i] = "#C20000";
            downYearCount++;
        }
        
        
        //add label for annual graph (e.g., either "2008" or "2008 partial")
        if(currentYearStartDate.getDate() != 31 || currentYearEndDate.getDate() != 31 || currentYearStartDate.getMonth() != 11 || currentYearEndDate.getMonth() != 11){
            annualReturnLabels[i] = "Partial "+(firstReturnYear+i);   
        } else{
            annualReturnLabels[i] = firstReturnYear+i;
        }
        
        /* testing
        console.log("Current Year Start Date: "+currentYearStartDate);
        console.log("Current Year End Date: "+currentYearEndDate);

        console.log("current year start price: "+currentYearStartPrice);
        console.log("current year end price: "+currentYearEndPrice);

        console.log("Current Year Return :"+currentYearReturn);

        console.log("current days from min date: "+currentDaysFromMinDate);
        console.log("current days in period: "+currentDaysInPeriod);
        */
    }

    console.log("Annual return array: "+annualReturns);
    console.log("Annual return label array: "+annualReturnLabels);
}

//calculate median value of an array
function median(values){
    values.sort(function(a,b){
    return a-b;
  });

  if(values.length ===0) return 0

  var half = Math.floor(values.length / 2);

  if (values.length % 2)
    return values[half];
  else
    return (values[half - 1] + values[half]) / 2.0;
}
