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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.9, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Get User Profile"], "isController": false}, {"data": [1.0, 500, 1500, "Delete User"], "isController": false}, {"data": [1.0, 500, 1500, "Get Contact"], "isController": false}, {"data": [1.0, 500, 1500, "Delete Contact"], "isController": false}, {"data": [0.75, 500, 1500, "Add Users"], "isController": false}, {"data": [1.0, 500, 1500, "Log Out User"], "isController": false}, {"data": [1.0, 500, 1500, "Add Contact"], "isController": false}, {"data": [1.0, 500, 1500, "Update User"], "isController": false}, {"data": [1.0, 500, 1500, "Log In User"], "isController": false}, {"data": [1.0, 500, 1500, "Update Contact - PATCH"], "isController": false}, {"data": [1.0, 500, 1500, "Get Contact List"], "isController": false}, {"data": [0.0, 500, 1500, "Transaction Controller"], "isController": true}, {"data": [1.0, 500, 1500, "Update Contact - PUT"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 70, 0, 0.0, 368.22857142857123, 283, 1176, 306.5, 342.8, 1126.45, 1176.0, 11.836320595197837, 11.678624080571526, 7.028640989600947], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Get User Profile", 5, 0, 0.0, 288.0, 283, 291, 289.0, 291.0, 291.0, 291.0, 4.901960784313726, 4.107306985294118, 2.5036381740196076], "isController": false}, {"data": ["Delete User", 5, 0, 0.0, 293.2, 289, 298, 295.0, 298.0, 298.0, 298.0, 4.887585532746823, 3.1416101539589447, 2.84472751710655], "isController": false}, {"data": ["Get Contact", 5, 0, 0.0, 298.0, 293, 300, 299.0, 300.0, 300.0, 300.0, 4.9800796812749, 5.2008761827689245, 2.665120766932271], "isController": false}, {"data": ["Delete Contact", 5, 0, 0.0, 303.8, 298, 315, 302.0, 315.0, 315.0, 315.0, 4.975124378109452, 3.6652674129353238, 3.021999378109453], "isController": false}, {"data": ["Add Users", 10, 0, 0.0, 734.1999999999999, 317, 1176, 737.5, 1171.2, 1176.0, 1176.0, 1.8857250612860645, 2.312591339807656, 0.7448982297755987], "isController": false}, {"data": ["Log Out User", 5, 0, 0.0, 300.2, 294, 305, 300.0, 305.0, 305.0, 305.0, 5.0, 3.2021484375, 2.6708984375], "isController": false}, {"data": ["Add Contact", 5, 0, 0.0, 305.6, 298, 316, 305.0, 316.0, 316.0, 316.0, 4.821600771456123, 5.047613307618129, 4.087060028929605], "isController": false}, {"data": ["Update User", 5, 0, 0.0, 325.0, 313, 336, 325.0, 336.0, 336.0, 336.0, 4.708097928436911, 3.944871115819209, 3.0988847693032016], "isController": false}, {"data": ["Log In User", 10, 0, 0.0, 322.99999999999994, 315, 341, 320.0, 340.7, 341.0, 341.0, 2.2512381809995494, 2.7542492120666364, 0.9695273806843764], "isController": false}, {"data": ["Update Contact - PATCH", 5, 0, 0.0, 317.4, 304, 325, 319.0, 325.0, 325.0, 325.0, 4.940711462450593, 5.144322813735178, 3.141018712944664], "isController": false}, {"data": ["Get Contact List", 5, 0, 0.0, 307.4, 293, 343, 299.0, 343.0, 343.0, 343.0, 4.906771344455349, 5.1262343596663404, 4.082587095191364], "isController": false}, {"data": ["Transaction Controller", 5, 0, 0.0, 5155.2, 5103, 5240, 5154.0, 5240.0, 5240.0, 5240.0, 0.8460236886632826, 11.68652839467005, 7.033398107021997], "isController": true}, {"data": ["Update Contact - PUT", 5, 0, 0.0, 302.2, 299, 307, 302.0, 307.0, 307.0, 307.0, 4.9800796812749, 5.184340761952191, 4.576420878984064], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 70, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
