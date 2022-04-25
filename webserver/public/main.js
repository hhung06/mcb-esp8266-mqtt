var socket = io("http://localhost:9999")

socket.on("server-update-data", function (data) {
    // Home page
    $("#currentTemp").html(data.temp)
    $("#currentHumi").html(data.humi)
    $("#currentLight").html(data.light)
    // Warning
    var warningSection = document.getElementById("warningSection")
    if (data.temp > 25 || data.humi < 20) alert('WARNING!!!')
    //History page
    $("#id-content").append("<div class='h-para'>" + data.id + "</div>")
    $("#time-content").append("<div class='h-para'>" + data.time + "</div>")
    $("#temp-content").append("<div class='h-para'>" + data.temp + "</div>")
    $("#humi-content").append("<div class='h-para'>" + data.humi + "</div>")
    $("#light-content").append("<div class='h-para'>" + data.light + "</div>")   
})

socket.on("send-full", function (data) {
    // History page
    $("#time-content").html("")
    $("#temp-content").html("")
    $("#humi-content").html("")
    $("#light-content").html("")
    $("#id-content").html("")
    console.log(data)
    data.forEach(function (item) {
        $("#time-content").append("<div class='h-para'>" + item.time + "</div>")
        $("#temp-content").append("<div class='h-para'>" + item.temp + "</div>")
        $("#humi-content").append("<div class='h-para'>" + item.humi + "</div>")
        $("#light-content").append("<div class='h-para'>" + item.light + "</div>")
        $("#id-content").append("<div class='h-para'>" + item.id + "</div>")
    
    })
})

//-------------Control LED-------------
function LED1() {
    var checkBox = document.getElementById("LED1");
    if (checkBox.checked == true) {
        //alert('LED On')
        socket.emit("LED1Change", "on")
    } else {
        // alert('LED Off')
        socket.emit("LED1Change", "off")
    }
}

function LED2() {
    var checkBox = document.getElementById("LED2");
    if (checkBox.checked == true) {
        //alert('LED On')
        socket.emit("LED2Change", "on")
    } else {
        // alert('LED Off')
        socket.emit("LED2Change", "off")
    }
}

//-------------Widget-------------
(function ($) {
    "use strict";

    // Spinner
    var spinner = function () {
        setTimeout(function () {
            if ($('#spinner').length > 0) {
                $('#spinner').removeClass('show');
            }
        }, 1);
    };
    spinner();

    // Sidebar Toggler
    $('.sidebar-toggler').click(function () {
        $('.sidebar, .content').toggleClass("open");
        return false;
    });

    // Calender
    $('#calender').datetimepicker({
        inline: true,
        format: 'L'
    });
})(jQuery);