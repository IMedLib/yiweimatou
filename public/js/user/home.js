/**
 * Created by zhangruofan on 2015/12/29.
 */
$(function() {
    function getListHtml(data){
        var html="";
        $.each(data,function(value){
            html+="<div class='col-md-3 col-sm-6'>"
                +"<img class='img-responsive' src=''"+value.imgUrl+"'>"
                +"<div class='summary'>"
                +"<div class='title'>"+value.title+"</div>"
                +"<a href=''"+value.url+"'></a>"
                +"</div></div>";
        });
        return html;
    }

    var type = 1;
    $('[data-toggle="tooltip"]').tooltip();
    $('#show-left-menu').click(function() {
        if (type == 1) {
            $('#left-menu').animate({
                left: "0px"
            });
            $('#course-list-div').animate({
                left: "150px"
            });
            type = 2;
        } else {
            $('#left-menu').animate({
                left: "-201px"
            });
            $('#course-list-div').animate({
                left: "0px"
            });
            type = 1;
        }
        return false;
    });
    $('.course-search-list').click(function() {
        $('.course-search-list').attr('style', '');
        $(this).attr('style', 'background-color:#72c02c;');
    });
    $('#create-course').click(function() {
        location.href = "add_course.html"
    });
    $('#show-left-menu').click();
    /**
     * 左侧选择菜单
     */
    $('#left-menu li').click(function(){
        $('.content').hide();
        if($(this).id==="yunbook"){

            $('#yunbooklist').fadeIn();
        }else if($(this).id==="pic"){
            $('#piclist').fadeIn();
        }else if($(this).id==="video"){
            $('#videolist').fadeIn();
        }
    });
    function getCount(){

    }
    $('#yunbookp').jqPagination({
        max_page: Math.ceil(getCount() / limit),
        page_string: '第{current_page}页,共{max_page}页',
        paged: function (page) {
            getList($('#ybs'), limit, page);
        }
    });

})