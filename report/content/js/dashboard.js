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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9342857142857143, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get User Profile"], "isController": false}, {"data": [0.98, 500, 1500, "Add Contact"], "isController": false}, {"data": [1.0, 500, 1500, "Delete User"], "isController": false}, {"data": [0.96, 500, 1500, "Update User"], "isController": false}, {"data": [0.99, 500, 1500, "Log In User"], "isController": false}, {"data": [1.0, 500, 1500, "Get Contact"], "isController": false}, {"data": [0.96, 500, 1500, "Update Contact - PATCH"], "isController": false}, {"data": [0.96, 500, 1500, "Delete Contact"], "isController": false}, {"data": [0.64, 500, 1500, "Add Users"], "isController": false}, {"data": [0.98, 500, 1500, "Get Contact List"], "isController": false}, {"data": [1.0, 500, 1500, "Log Out User"], "isController": false}, {"data": [0.98, 500, 1500, "Update Contact - PUT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 350, 0, 0.0, 454.30000000000024, 305, 3176, 340.0, 842.3000000000138, 1318.45, 2526.13, 21.244309559939303, 20.974428584977236, 12.591580519726858], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get User Profile", 25, 0, 0.0, 323.96, 305, 364, 323.0, 341.20000000000005, 361.3, 364.0, 2.3759741494012547, 2.007883779224482, 1.2135102345086486], "isController": false}, {"data": ["Add Contact", 25, 0, 0.0, 358.87999999999994, 320, 985, 327.0, 357.8, 799.8999999999996, 985.0, 2.3757483607336307, 2.4645605162501187, 1.9790169450251829], "isController": false}, {"data": ["Delete User", 25, 0, 0.0, 339.1600000000001, 317, 402, 328.0, 382.8, 396.59999999999997, 402.0, 2.27004449287206, 1.4630259409334423, 1.3212368337419413], "isController": false}, {"data": ["Update User", 25, 0, 0.0, 418.24, 339, 1101, 356.0, 664.4000000000015, 1092.6, 1101.0, 2.3649607416516885, 1.9948813380947876, 1.5566245506574592], "isController": false}, {"data": ["Log In User", 50, 0, 0.0, 365.37999999999994, 333, 895, 350.5, 377.5, 388.84999999999997, 895.0, 3.381119826886665, 4.147947237625101, 1.4561268004463077], "isController": false}, {"data": ["Get Contact", 25, 0, 0.0, 333.88000000000005, 307, 379, 327.0, 363.00000000000006, 376.9, 379.0, 2.3773297831875237, 2.450878423354888, 1.2722428917839483], "isController": false}, {"data": ["Update Contact - PATCH", 25, 0, 0.0, 387.88, 322, 908, 335.0, 643.6000000000009, 904.1, 908.0, 2.2692202959063263, 2.370892002133067, 1.4426390748388855], "isController": false}, {"data": ["Delete Contact", 25, 0, 0.0, 377.44, 313, 886, 336.0, 562.6000000000012, 885.1, 886.0, 2.2694262890341323, 1.6818576388888888, 1.3784991716594046], "isController": false}, {"data": ["Add Users", 50, 0, 0.0, 1022.1599999999999, 343, 3176, 829.0, 2429.499999999999, 2680.8999999999987, 3176.0, 3.163155563990637, 3.888333689188334, 1.249508228158411], "isController": false}, {"data": ["Get Contact List", 25, 0, 0.0, 359.64, 320, 929, 329.0, 394.40000000000015, 781.3999999999996, 929.0, 2.37936613686114, 2.4649675513943086, 1.982030580803274], "isController": false}, {"data": ["Log Out User", 25, 0, 0.0, 331.8, 314, 355, 330.0, 352.0, 354.1, 355.0, 2.2708692887637385, 1.4646219854210192, 1.2130522470251612], "isController": false}, {"data": ["Update Contact - PUT", 25, 0, 0.0, 354.24000000000007, 319, 914, 330.0, 348.8, 744.7999999999996, 914.0, 2.37146651489281, 2.47058640438247, 2.174616267074559], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 350, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
