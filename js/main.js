$(window).ready(function() {

  var quizQuestions = null;
  var quizImage = null;
  var quizLoaded = false;

  $('#menu').sidr();
  vex.defaultOptions.className = 'vex-theme-wireframe';

  $(window).bind('beforeunload', function(){
    return 'Želiš končati s kvizom?';
  });

  openImage = function(event) {
    var input  = event.target;
    var reader = new FileReader();
    reader.onload = function() {
      var image = new Image(); 
      image.src = reader.result;
      image.onload = function() {
        quizImage = this;
        $('#btn-load-image span').addClass("tick");
      }
    };
    reader.readAsDataURL(input.files[0]);
  }

  openText = function(event) {
    var input  = event.target;
    var reader = new FileReader();
    reader.onload = function() {
      try {
        quizQuestions = JSON.parse(reader.result);
        $('#btn-load-questions span').addClass("tick");
      } catch(e) {
        vex.dialog.alert("Vhodna datoteka z vprašanji ni pravilna.");
      }
    }
    reader.readAsText(input.files[0]);
  };

  function placeImg(img) {
    var wW = $(window).width()
      , wH = $(window).height() - $('.header').height()
      , iW = img.width
      , iH = img.height;

    if(wW < iW) {
      iH = wW / iW * iH *0.95; 
      iW = wW * 0.95;
    }
    if(wH < iH) {
      iW = wH / iH * iW *0.95; 
      iH = wH * 0.95;
    }

    $('#quiz-table').css('background-image', "url(" + img.src + ")");
    $('#quiz-table').height(iH);
    $('#quiz-table').width(iW);
  }

  function drawTable() {
    var numberOfQuestions = quizQuestions.length
      , qRoot = Math.sqrt(numberOfQuestions)
      , x
      , y;
    if (Math.round(qRoot) > qRoot) {
      x = Math.ceil(qRoot);
      y = x;
    } else {
      x = Math.ceil(qRoot);
      y = Math.floor(qRoot);
    }
    remain = (x * y) > numberOfQuestions ? x * y - numberOfQuestions : 0;

    var t = '<table cellspacing="0" border="1" cellpadding="0" class="grxd">';
    for (var i = 1; i <= numberOfQuestions; i++) {
      t += (i == 1 ? '<tr>' : '');
      if(i > numberOfQuestions - remain) {
        t += '<td class="click-me text-center" data-id="' + i + '" colspan=2>' + i + '</td>';
        if (i == numberOfQuestions) {
          t += '</tr>';
        } else {
          t += ((i+1) % y === 0 ? '</tr><tr>' : '');
        }
      } else {
        t += '<td class="click-me text-center" data-id="' + i + '">' + i + '</td>';
        if (i == numberOfQuestions) {
          t += '</tr>';
        } else {
          t += (i % y === 0 ? '</tr><tr>' : '');
        }
      }
    }
    t += '</table>';

    $("#quiz-table").html(t);
  }

  function loadQuiz() {
    quizLoaded = true;
    $('.content h1').hide();
    $('#quiz-help').hide('fast');
    $('#quiz-table').show('fast', function() {
      drawTable();
      placeImg(quizImage);
      $(window).off('resize');
      $(window).resize(function() {
        placeImg(quizImage);
      });
    });
  }

  $("#quiz-table").on('click', '.click-me', function() {
    var self = this;
    var oNext = $(self).css('opacity') != 1 ? 1 : 0;
    var id = $(self).data("id");
    var q = $.grep(quizQuestions, function(e){ return e.id == id; });
    if(q.length == 0) {vex.dialog.alert("Vprašanje za to polje ni definirano"); return;}

    vex.dialog.open({
      message: "Vprašanje " + id + ":<br />" + q[0].text,
      afterOpen: function($vexContent) {
        if(typeof q[0].imgUrl !== "undefined") {return $vexContent.append('<img class="q-img" src="' + q[0].imgUrl +'" />')};
        if(typeof q[0].ytId !== "undefined") {return $vexContent.append('<iframe class="q-video" src="https://www.youtube.com/embed/' + q[0].ytId +'" frameborder="0" allowfullscreen></iframe>')};
      },
      buttons: [
        $.extend({}, vex.dialog.buttons.YES, {
          text: 'Pravilno'
        }), $.extend({}, vex.dialog.buttons.NO, {
          text: 'Napačno'
        })
      ],
      callback: function(value) {
        if(value) { $(self).animate({opacity:oNext}); }
      }
    });
  })

  $('#quiz-create').on('click', function() {
    if(quizQuestions === null || quizImage === null) {
      vex.dialog.alert("Naloži vse potrebne datoteke na kviz.");
      return;
    }
    if(quizLoaded) {
      vex.dialog.open({
        message: "Želiš naložiti nov kviz?",
        buttons: [
          $.extend({}, vex.dialog.buttons.YES, {
            text: 'Da'
          }), $.extend({}, vex.dialog.buttons.NO, {
            text: 'Ne'
          })
        ],
        callback: function(value) {
          if(value) {
            loadQuiz();
          }
        }
      });
    } else {
      loadQuiz();
    }
  });

  $('#quiz-reveal').on('click', function() {
    if(!quizLoaded) {return;}
    vex.dialog.open({
      message: "Odkrij vsa polja?",
      buttons: [
        $.extend({}, vex.dialog.buttons.YES, {
          text: 'Da'
        }), $.extend({}, vex.dialog.buttons.NO, {
          text: 'Ne'
        })
      ],
      callback: function(value) {
        if(value) {$('.click-me').css('opacity', 0);}
      }
    });
  })
  $('#quiz-hide').on('click', function() {
    if(!quizLoaded) {return;}
    vex.dialog.open({
      message: "Skrij vsa polja?",
      buttons: [
        $.extend({}, vex.dialog.buttons.YES, {
          text: 'Da'
        }), $.extend({}, vex.dialog.buttons.NO, {
          text: 'Ne'
        })
      ],
      callback: function(value) {
        if(value) {$('.click-me').css('opacity', 1);}
      }
    });
  })
  $('.toggle-help').on('click', function() {
    $('.content h1').hide('fast');
    $('#quiz-help').toggle('fast');
    $('#quiz-table').toggle('fast');
  });

});

