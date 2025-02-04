/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 71.42857142857143, "KoPercent": 28.571428571428573};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6428571428571429, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get User Profile"], "isController": false}, {"data": [1.0, 500, 1500, "Add Contact"], "isController": false}, {"data": [1.0, 500, 1500, "Delete User"], "isController": false}, {"data": [1.0, 500, 1500, "Update User"], "isController": false}, {"data": [1.0, 500, 1500, "Log In User"], "isController": false}, {"data": [1.0, 500, 1500, "Get Contact"], "isController": false}, {"data": [0.0, 500, 1500, "Update Contact - PATCH"], "isController": false}, {"data": [0.0, 500, 1500, "Delete Contact"], "isController": false}, {"data": [0.25, 500, 1500, "Add Users"], "isController": false}, {"data": [1.0, 500, 1500, "Get Contact List"], "isController": false}, {"data": [0.5, 500, 1500, "Log Out User"], "isController": false}, {"data": [0.0, 500, 1500, "Update Contact - PUT"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 140, 40, 28.571428571428573, 2522.892857142858, 0, 30274, 315.0, 1141.3, 30266.0, 30273.59, 3.522367030644593, 3.8085593518844663, 1.9153853532430936], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get User Profile", 10, 0, 0.0, 289.20000000000005, 276, 305, 285.5, 304.9, 305.0, 305.0, 2.1482277121374866, 1.804175617615467, 1.0971905209452202], "isController": false}, {"data": ["Add Contact", 10, 0, 0.0, 303.79999999999995, 292, 322, 302.0, 321.7, 322.0, 322.0, 2.145002145002145, 2.2191555394680393, 1.7868035446160446], "isController": false}, {"data": ["Delete User", 10, 0, 0.0, 315.90000000000003, 285, 475, 299.0, 458.50000000000006, 475.0, 475.0, 2.1621621621621623, 1.390625, 1.258445945945946], "isController": false}, {"data": ["Update User", 10, 0, 0.0, 325.5, 307, 349, 324.5, 347.6, 349.0, 349.0, 2.1253985122210413, 1.784172422954304, 1.39894394261424], "isController": false}, {"data": ["Log In User", 20, 0, 0.0, 320.55, 306, 335, 319.5, 332.6, 334.9, 335.0, 0.5229715242005073, 0.6408444028972622, 0.22522504118400752], "isController": false}, {"data": ["Get Contact", 10, 0, 0.0, 298.4, 290, 309, 296.5, 309.0, 309.0, 309.0, 2.1510002151000216, 2.215698268444827, 1.1511212088621208], "isController": false}, {"data": ["Update Contact - PATCH", 10, 10, 100.0, 30268.100000000002, 30261, 30274, 30267.0, 30273.9, 30274.0, 30274.0, 0.28890044490668515, 0.343972092217022, 0.16222437091928124], "isController": false}, {"data": ["Delete Contact", 10, 10, 100.0, 0.8, 0, 1, 1.0, 1.0, 1.0, 1.0, 2.300966405890474, 4.7704606247123795, 0.0], "isController": false}, {"data": ["Add Users", 20, 10, 50.0, 729.95, 312, 1203, 718.5, 1185.9, 1202.35, 1203.0, 0.5112213077041051, 0.6279435164357651, 0.20194240133428762], "isController": false}, {"data": ["Get Contact List", 10, 0, 0.0, 305.29999999999995, 287, 338, 299.5, 337.7, 338.0, 338.0, 2.1496130696474633, 2.2176281706792778, 1.788545249355116], "isController": false}, {"data": ["Log Out User", 10, 0, 0.0, 843.8, 800, 913, 837.5, 911.7, 913.0, 913.0, 1.9065776930409915, 1.2277317683508102, 1.0184550762631077], "isController": false}, {"data": ["Update Contact - PUT", 10, 10, 100.0, 268.70000000000005, 263, 275, 269.5, 274.7, 275.0, 275.0, 2.162629757785467, 1.9539697772491351, 1.9780459288494812], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["400/Bad Request", 10, 25.0, 7.142857142857143], "isController": false}, {"data": ["Test failed: code expected to equal /\\n\\n****** received  : 20[[[1]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 10, 25.0, 7.142857142857143], "isController": false}, {"data": ["503/Service Unavailable", 10, 25.0, 7.142857142857143], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 10, 25.0, 7.142857142857143], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 140, 40, "400/Bad Request", 10, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[1]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 10, "503/Service Unavailable", 10, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 10, "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Update Contact - PATCH", 10, 10, "503/Service Unavailable", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Delete Contact", 10, 10, "Non HTTP response code: org.apache.http.NoHttpResponseException/Non HTTP response message: thinking-tester-contact-list.herokuapp.com:443 failed to respond", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Add Users", 20, 10, "Test failed: code expected to equal /\\n\\n****** received  : 20[[[1]]]\\n\\n****** comparison: 20[[[0]]]\\n\\n/", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Update Contact - PUT", 10, 10, "400/Bad Request", 10, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
