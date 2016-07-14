$(document).ready(function(){
    // initial popover
    $(function() {
        $('[data-toggle="popover"]').popover();
    });

    // login ajax
    $('form#form-login').submit(function(evt) {
        evt.preventDefault();
        var $messageC = $('#loginM');
        $.ajax({
            url: '/alogin',
            type: 'POST',
            data: $('form#form-login').serialize(),
            success: function(data) {
                if (data.success) {
                    $messageC.html("登录成功！");
                    location.reload();
                } else {
                    $messageC.html(data.message);
                    $messageC.addClass('alert alert-danger');
                }
            },
            error: function() {
                location.reload();
            }
        });
    });

    // register ajax
    $('form#form-register').submit(function(evt) {
        evt.preventDefault();
        var $messageC = $('#registerM');
        $.ajax({
            url: '/aregister',
            type: 'POST',
            data: $('form#form-register').serialize(),
            success: function(data) {
                if (data.success) {
                    $messageC.html("注册成功！");
                    location.reload();
                } else {
                    $messageC.html(data.message);
                    $messageC.addClass('alert alert-danger');
                }
            },
            error: function() {
                location.reload();
            }
        });
    });

    // comment ajax
    $('form#form-comment').submit(function(evt) {
        evt.preventDefault();
        var $postMessage = $('#post-message');
        var $commentsArea = $('#comments-area');
        $.ajax({
            url: '/acomment',
            type: 'POST',
            data: $('form#form-comment').serialize(),
            success: function(data) {
                if (!data.login) {
                    $postMessage.attr('data-content', '评论前需先登录！');
                    $postMessage.click();
                    setTimeout(function() {
                        $postMessage.click();
                    }, 2000);
                } else if (!data.success) {
                    alert(data.login);
                    $postMessage.attr('data-content', '评论失败，请重试！');
                    $postMessage.click();
                    setTimeout(function() {
                        $postMessage.click();
                    }, 2000);
                } else {
                    var createTime = new Date(data.comment.createTime);
                    $commentsArea.append("<div class='row'><div class='col-sm-2 col-xs-2 img-area'><p class='text-center'><a href='/user/"+data.comment.uid+"'><img src='/imgs/photo/"+data.comment.user.photo+"' width='40px' class='img-rounded'></a></p></div><div class='col-sm-10 col-xs-10'><div><p><a href='/user/"+data.comment.uid+"'><small>"+data.comment.user.name+"</small></a></p><p>"+data.comment.content+"</p><p><small>"+ createTime.getFullYear()+"-"+(createTime.getMonth()+1)+"-"+createTime.getDate()+" 发表评论</small></p></div></div></div><hr>");
                    $('#add-comment-area').val('');
                }
            },
            error: function() {
                $postMessage.attr('data-content', '评论失败，请重试！');
                $postMessage.click();
                setTimeout(function() {
                    $postMessage.click();
                }, 3000);
            }
        });
    });
});










