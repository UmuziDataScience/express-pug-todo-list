window.tasksApi = (function () {
    var urlBase = '/api/tasks';
    var tasksApi = {
        getTasks: function(filter){
            var deferred = new $.Deferred();
            var jqXHR = $.ajax({
                url: urlBase,
                data: {filter: filter},
                method: 'get'
            }).done(function(data){
                deferred.resolve(data);
            }).fail(function(jqXHR, textStatus, errorThrown){
                deferred.reject(jqXHR);
            });
            return deferred.promise();
        },
        postTask: function(data){
            var deferred = new $.Deferred();
            var jqXHR = $.ajax({
                url: urlBase,
                data: data,
                method: 'post'
            }).done(function(data){
                console.log('postTask DONE',data);
                deferred.resolve(data);
            }).fail(function(jqXHR, textStatus, errorThrown){
                deferred.reject(jqXHR);
            });
            return deferred.promise();
        },
        getTask: function(id){
            var deferred = new $.Deferred();
            var jqXHR = $.ajax({
                url: urlBase+'/'+id,
                method: 'get'
            }).done(function(data){
                deferred.resolve(data);
            }).fail(function(jqXHR, textStatus, errorThrown){
                deferred.reject(jqXHR);
            });
            return deferred.promise();
        },
        deleteTask: function(id){
            var deferred = new $.Deferred();
            var jqXHR = $.ajax({
                url: urlBase+'/'+id,
                method: 'delete'
            }).done(function(data){
                deferred.resolve(data);
            }).fail(function(jqXHR, textStatus, errorThrown){
                deferred.reject(jqXHR);
            });
            return deferred.promise();
        },
        updateTask: function(id, status){
            var deferred = new $.Deferred();
            var jqXHR = $.ajax({
                url: urlBase+'/'+id,
                data: {status: status},
                method: 'put'
            }).done(function(data){
                deferred.resolve(data);
            }).fail(function(jqXHR, textStatus, errorThrown){
                deferred.reject(jqXHR);
            });
            return deferred.promise();
        },
    }
    return tasksApi;
}());
$(function(){
    getComboTarks();
});
$(document).on('submit', '#form', function(e){
    e.preventDefault();
    console.log($('button[type="submit"]'));
    if(!$('button[type="submit"]').hasClass('disabled')) {
        $('button[type="submit"]').addClass('disabled');
        cleanFormErrors();
        tasksApi.postTask($(this).serialize()).done(function (data) {
            console.log(data);
            cleanForm();
        }).fail(function (err) {
            var obj = JSON.parse(err.responseText);
            if(obj.errors){
                if(obj.errors.title){
                    $('.form-group-title').addClass('has-error');
                    $('#help-task-name').html(obj.errors.title.message);
                }
                if(obj.errors.description){
                    $('.form-description').addClass('has-error');
                    $('#help-task-description').html(obj.errors.description.message);
                }
            }
        }).always(function () {
            console.log('call is done');
            $('button[type="submit"]').removeClass('disabled');
        });
    }
});
$(document).on('click', '.delete', function(e){
    e.preventDefault();
    var id = $(this).closest('.task').attr('data-id');
    $.confirm({
        title: 'Confirm Delete!',
        content: 'Please confirm deletion of <b>'+$(this).closest('.task').find('.title').html()+' </b>',
        buttons: {
            confirm: {
                text: 'Yes - Delete',
                btnClass: 'btn-info',
                keys: ['enter'],
                action: function(){
                    tasksApi.deleteTask(id).done(function(data){
                        console.log(data);
                    }).fail(function(err){
                        console.log(err);
                    }).always(function(){
                        console.log('call is done');
                    });
                }
            },
            cancel: {
                text: 'Cancel',
                btnClass: 'btn-default',
                keys: ['enter'],
                action: function(){
                }
            }
        }
    });


});
$(document).on('click', '.status', function(e){
    e.preventDefault();
    tasksApi.updateTask($(this).closest('.task').attr('data-id'), ($(this).closest('.task').attr('data-status')=='0')?1:0).done(function(data){
        console.log(data);
    }).fail(function(err){
        console.log(err);
    }).always(function(){
        console.log('call is done');
    });
});

$(document).on('click', '.toggle-description', function(e){
    console.log($('.form-description').hasClass('bounceOut'));
    if($('.form-description').hasClass('bounceOut') || $('.form-description').hasClass('hidden')){
        $('.form-description').removeClass('hidden');
        $('.form-description').addClass('bounceIn animated');
    }else{
        $('.form-description').addClass('bounceOut animated');
    }
    $('.form-description').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function (){
        if($('.form-description').hasClass('bounceOut')){
            $('.form-description').addClass('hidden');
            $('.form-description').removeClass('bounceOut');
        }else{
            $('.form-description').removeClass('bounceIn');
        }
        $('.form-description').removeClass('animated');

    });
});
socket.on('onUpdateData', function (data) {
    getComboTarks();
});


function getComboTarks(){
    getTasks('#tasks-container', 0);
    getTasks('#tasks-container-done', 1);
}
function getTasks(target, status){
    tasksApi.getTasks({status: status}).done(function(data){
        $(target).html('');
        for (var i = 0; i < data.length; i ++){
            renderTask(data[i], target);
        }
    }).fail(function(err){
        console.log(err);
    }).always(function(){
        console.log('call is done');
    });
}
function renderTask(data, target){
    var $task = $('#task').clone().removeAttr('id');
    $task.attr('data-id', data._id);
    $task.attr('data-status', data.status || 0);
    $task.find('.title').html(data.title || '');
    $task.find('.description').html(data.description || '');
    $task.find('.status').html(data.status?'mark as undone': 'mark as done');
    $(target).append($task);
}
function cleanFormErrors(){
    $('.form-group-title').removeClass('has-error');
    $('.form-description').removeClass('has-error');
    $('#help-task-name').html('');
    $('#help-task-description').html('');
}

function cleanForm(){
    cleanFormErrors();
    $('#form').trigger("reset");
    if(!$('.form-description').hasClass('hidden')){
        $('.toggle-description').trigger('click');
    }
}