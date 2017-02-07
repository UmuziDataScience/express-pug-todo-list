/**
 * Created by asus on 22/01/17.
 */

$(function(){
    setTimeout(function () {
        $('body').addClass('loaded');
    },400);
});

var socket = io();

