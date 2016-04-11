var poems,
    poem_titles,
    lb_i = 0,
    thb_i = 0;

var squares = [];
var squares_time = 0;
var sq_t_i = 1;
var right_offset = 0;

var body_scale = 1;
var scene_index = 0;

//LOAD Poems
$.getJSON( "assets/poems.json", function( data ) {
    poems = data;
    poem_titles = Object.keys(poems);
 });

$('#info_button').click(function(){
	    console.log($('#info').css('visibility'))
	    if ($('#info').css('visibility') == 'hidden') {
			        $('#info_button').html('-i')
	        $('#info').css('visibility', 'visible')
	    } else  {
			        $('#info_button').html('+i')
	        $('#info').css('visibility', 'hidden')
	    }
})

$('.clickable').click(function() {
    scene_index++ 
    if (scene_index == 1) {
        $('#splash-banner').css('display', 'none')
        $('#lost-body').css('display', 'inline')
        $('#the-human-body').css('display', 'inline')
        $('#lost-body').html(poems['lost_body'][lb_i])
        $('#the-human-body').html(poems['the_human_body'][thb_i])
        populate_shapes()
        animate_squares = setInterval(animate_all, 33);
    }
})

$('#lost-body').click(function() {
    lb_i++;
    right_offset++;
    $('#lost-body').html(poems['lost_body'][lb_i])
    if (lb_i>=poems['lost_body'].length)
        composeGeometry(cubeHolder, material, 30, {geometry: body_geometry, nested : false, dims : [50,300,50], spread : 100, randRot: true, scale: body_scale + 2});
})

$('#the-human-body').click(function() {
    thb_i++;
    right_offset++;
    console.log(right_offset)
    $('#the-human-body').html(poems['the_human_body'][thb_i])
    if (thb_i>=poems['the_human_body'].length)
        composeGeometry(cubeHolder, material, 30, {geometry: body_geometry, nested : false, dims : [50,300,50], spread : 100, randRot: true, scale: 5});
})

function populate_shapes() {
    var square_count = 0;
    for(var i = 0; i< 18; i++) {
        var square = $("<div class='square' id='square_"+i.toString()+"'></div>");
        $('body').append(square);
        squares.push(square)
    }
    $('.square').click(function() {
        body_scale++;
        console.log('square!')
        composeGeometry(cubeHolder, material, 30, {geometry: body_geometry, nested : false, dims : [50,300,50], spread : 1000, randRot: false, scale: body_scale});
    })
}

function animate_all() {
    squares_time += 4;
    for (var i = 0; i < squares.length; i++) {
        animate_square(squares[i], squares_time, i);
    }
}

function animate_square(square, t, i) {
    var top = square.css('top').replace(/\D/g,'');
    var right = square.css('right').replace(/\D/g,'');
    
    /*
    var new_top = (Number(top) + t +  Math.floor(Math.random()*2)).toString() + "px"
    var new_left = (Number(left) + t+ Math.floor(Math.random()*2)).toString() + "px"
    */
    
    var w = window.innerWidth
    var h = window.innerHeight
    
    var m = 1;
    if (i%2 == 0)
        m = -1
        
    var s1 = Math.sin((t+(i*10))/100),
        s2 = Math.sin((t+(i*5))/100),
        s3 = Math.sin((t+(i*1))/50)
    
    var new_right = (((s1)*(w/4) + w/2-50)*((right_offset/(poems['the_human_body'].length + poems['lost_body'].length)))).toString() + "px"
    var new_top = (s1*(h/4) + h/2-50).toString() + "px"
    
    square.css('top', new_top)
    square.css('right', new_right)
    
    square.css('-webkit-transform','rotate('+(t+i).toString()+'deg)')
}
