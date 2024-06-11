$(document).ready(function(){

  /*===============================
  =            Sliders            =
  ===============================*/
  
  if($('.ad-main-slider').length){
    $('.ad-main-slider').slick({
      speed: 250,
      arrows: false,
      autoplay: true,
      dots: false
    });  
  }

  if($('.ad-industry-detail-slider').length){
    $('.ad-industry-detail-slider').slick({
      speed: 250,
      arrows: true,
      autoplay: true,
      prevArrow:'<span class="ad-arrow-left"><i class="ad-icon-caret-left-thin"></i></span>',
      nextArrow:'<span class="ad-arrow-right"><i class="ad-icon-caret-right-thin"></i></span>',
      slidesToShow: 3,
      slidesToScroll: 1,
      dots: false,
      responsive: [
      {
        breakpoint: 1300,
        settings: {
          arrows: false,
        }
      },
      {
        breakpoint: 991,
        settings: {
          arrows: false,
          slidesToShow: 2
        }
      },
      {
        breakpoint: 767,
        settings: {
          arrows: false,
          slidesToShow: 1
        }
      }]
    });
  }
  
  /*=====  End of Sliders  ======*/
  

  /*============================================
    =            Custom Select Picker            =
    ============================================*/
    
    if($('.ad-select').length){
      $('.ad-select').selectpicker();      
    }

    $('[data-toggle="tooltip"]').tooltip()
    
    /*=====  End of Custom Select Picker  ======*/
    
})


const realFileBtn = document.getElementById("real-file");
const customBtn = document.getElementById("custom-button");
const customTxt = document.getElementById("custom-text");

customBtn.addEventListener("click", function() {
  realFileBtn.click();
});

realFileBtn.addEventListener("change", function() {
  if (realFileBtn.value) {
    customTxt.innerHTML = realFileBtn.value.match(
      /[\/\\]([\w\d\s\.\-\(\)]+)$/
    )[1];
  } else {
    customTxt.innerHTML = "No file chosen, yet.";
  }
});

var sideheight = $(window).height() - $('.navbar-default').height() - 46;
$('.zm-provider-middle .zm-prov-sidebar').css('min-height', sideheight);