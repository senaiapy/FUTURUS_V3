(function ($) {
  "use strict";

  //Update Header Style and Scroll to Top
  function headerStyle() {
    if ($(".main-header").length) {
      var windowpos = $(window).scrollTop();
      var siteHeader = $(".main-header");
      var scrollLink = $(".scroll-top");
      if (windowpos >= 150) {
        siteHeader.addClass("fixed-header");
        scrollLink.addClass("open");
      } else {
        siteHeader.removeClass("fixed-header");
        scrollLink.removeClass("open");
      }
    }
  }

  headerStyle();

  //Submenu Dropdown Toggle
  if ($(".main-header li.dropdown ul").length) {
    $(".main-header .navigation li.dropdown").append(
      '<div class="dropdown-btn"><span class="fas fa-angle-down"></span></div>'
    );
  }

  //Mobile Nav Hide Show
  if ($(".mobile-menu").length) {
    var mobileMenuContent = $(".main-header .menu-area .main-menu").html();
    $(".mobile-menu .menu-box .menu-outer").append(mobileMenuContent);
    $(".sticky-header .main-menu").append(mobileMenuContent);

    //Dropdown Button
    $(".mobile-menu li.dropdown .dropdown-btn").on("click", function () {
      $(this).toggleClass("open");
      $(this).prev("ul").slideToggle(500);
    });
    //Dropdown Button
    $(".mobile-menu li.dropdown .dropdown-btn").on("click", function () {
      $(this).prev(".megamenu").slideToggle(900);
    });
    //Menu Toggle Btn
    $(".mobile-nav-toggler").on("click", function () {
      $("body").addClass("mobile-menu-visible");
    });

    //Menu Toggle Btn
    $(".mobile-menu .menu-backdrop,.mobile-menu .close-btn").on(
      "click",
      function () {
        $("body").removeClass("mobile-menu-visible");
      }
    );
  }

  // Elements Animation
  if ($(".wow").length) {
    var wow = new WOW({
      mobile: false,
    });
    wow.init();
  }

  //Contact Form Validation
  if ($("#contact-form").length) {
    $("#contact-form").validate({
      rules: {
        username: {
          required: true,
        },
        email: {
          required: true,
          email: true,
        },
        phone: {
          required: true,
        },
        subject: {
          required: true,
        },
        message: {
          required: true,
        },
      },
    });
  }

  //odometer
  if ($(".odometer").length > 0) {
    $.fn.isInViewport = function () {
      let elementTop = $(this).offset().top;
      let elementBottom = elementTop + $(this).outerHeight();
      let viewportTop = $(window).scrollTop();
      let viewportBottom = viewportTop + $(window).height();
      return elementBottom > viewportTop && elementTop < viewportBottom;
    };

    function startOdometer() {
      $(".odometer").each(function () {
        if ($(this).isInViewport()) {
          if (!$(this).data("odometer-started")) {
            $(this).data("odometer-started", true);
            this.innerHTML = $(this).data("odometer-final");
          }
        }
      });
    }
    $(window).on("scroll", startOdometer);
    $(window).on("load", startOdometer);
    $(document).ready(startOdometer);
  }

  //LightBox / Fancybox

  if ($(".lightbox-image").length) {
    $(".lightbox-image").each(function () {
      $(this).fancybox({
        openEffect: "fade",
        closeEffect: "fade",
        helpers: {
          media: {},
        },
      });
    });
  }

  //Tabs Box
  if ($(".tabs-box").length) {
    $(".tabs-box .tab-buttons .tab-btn").on("click", function (e) {
      e.preventDefault();
      var target = $($(this).attr("data-tab"));

      if ($(target).is(":visible")) {
        return false;
      } else {
        target
          .parents(".tabs-box")
          .find(".tab-buttons")
          .find(".tab-btn")
          .removeClass("active-btn");
        $(this).addClass("active-btn");
        target
          .parents(".tabs-box")
          .find(".tabs-content")
          .find(".tab")
          .fadeOut(0);
        target
          .parents(".tabs-box")
          .find(".tabs-content")
          .find(".tab")
          .removeClass("active-tab");
        $(target).fadeIn(100);
        $(target).addClass("active-tab");
      }
    });
  }

  //Accordion Box
  if ($(".accordion-box").length) {
    $(".accordion-box").on("click", ".acc-btn", function () {
      var outerBox = $(this).parents(".accordion-box");
      var target = $(this).parents(".accordion");

      if ($(this).hasClass("active") !== true) {
        $(outerBox).find(".accordion .acc-btn").removeClass("active");
      }

      if ($(this).next(".acc-content").is(":visible")) {
        return false;
      } else {
        $(this).addClass("active");
        $(outerBox).children(".accordion").removeClass("active-block");
        $(outerBox).find(".accordion").children(".acc-content").slideUp(300);
        target.addClass("active-block");
        $(this).next(".acc-content").slideDown(300);
      }
    });
  }

  // banner-carousel
  if ($(".banner-carousel").length) {
    $(".banner-carousel").owlCarousel({
      loop: true,
      margin: 0,
      nav: true,
      animateOut: "fadeOut",
      animateIn: "fadeIn",
      active: true,
      smartSpeed: 1000,
      autoplay: 6000,
      autoplay: true,
      navText: [
        '<span class="icon-10"></span>',
        '<span class="icon-11"></span>',
      ],
      responsive: {
        0: {
          items: 1,
        },
        600: {
          items: 1,
        },
        800: {
          items: 1,
        },
        1024: {
          items: 1,
        },
      },
    });
  }

  // single-item-carousel
  if ($(".single-item-carousel").length) {
    $(".single-item-carousel").owlCarousel({
      loop: true,
      margin: 30,
      nav: true,
      smartSpeed: 500,
      autoplay: 1000,
      navText: [
        '<span class="icon-34"></span>',
        '<span class="icon-35"></span>',
      ],
      responsive: {
        0: {
          items: 1,
        },
        480: {
          items: 1,
        },
        600: {
          items: 1,
        },
        800: {
          items: 1,
        },
        1200: {
          items: 1,
        },
      },
    });
  }

  // two-item-carousel
  if ($(".two-item-carousel").length) {
    $(".two-item-carousel").owlCarousel({
      loop: true,
      margin: 30,
      nav: true,
      smartSpeed: 500,
      autoplay: 1000,
      navText: [
        '<span class="icon-21"></span>',
        '<span class="icon-22"></span>',
      ],
      responsive: {
        0: {
          items: 1,
        },
        480: {
          items: 1,
        },
        600: {
          items: 1,
        },
        800: {
          items: 2,
        },
        1200: {
          items: 2,
        },
      },
    });
  }

  // three-item-carousel
  if ($(".three-item-carousel").length) {
    $(".three-item-carousel").owlCarousel({
      loop: true,
      margin: 30,
      nav: true,
      smartSpeed: 500,
      autoplay: 1000,
      navText: [
        '<span class="icon-34"></span>',
        '<span class="icon-35"></span>',
      ],
      responsive: {
        0: {
          items: 1,
        },
        480: {
          items: 1,
        },
        600: {
          items: 2,
        },
        800: {
          items: 2,
        },
        1200: {
          items: 3,
        },
      },
    });
  }

  // four-item-carousel
  if ($(".four-item-carousel").length) {
    $(".four-item-carousel").owlCarousel({
      loop: true,
      margin: 30,
      nav: true,
      smartSpeed: 500,
      autoplay: 1000,
      navText: [
        '<span class="icon-21"></span>',
        '<span class="icon-22"></span>',
      ],
      responsive: {
        0: {
          items: 1,
        },
        480: {
          items: 1,
        },
        600: {
          items: 2,
        },
        800: {
          items: 3,
        },
        1200: {
          items: 4,
        },
      },
    });
  }

  // five-item-carousel
  if ($(".five-item-carousel").length) {
    $(".five-item-carousel").owlCarousel({
      loop: true,
      margin: 30,
      nav: true,
      smartSpeed: 500,
      autoplay: 1000,
      navText: [
        '<span class="icon-21"></span>',
        '<span class="icon-22"></span>',
      ],
      responsive: {
        0: {
          items: 1,
        },
        480: {
          items: 2,
        },
        600: {
          items: 3,
        },
        800: {
          items: 4,
        },
        1200: {
          items: 5,
        },
      },
    });
  }

  if ($(".clients-slider").length) {
    $(".clients-slider").slick({
      slidesToShow: 6,
      slidesToScroll: 1,
      autoplay: true,
      autoplaySpeed: 2000,
      speed: 2000,
      arrows: false,
      pauseOnHover: true,
      responsive: [
        {
          breakpoint: 1400,
          settings: {
            slidesToShow: 5,
          },
        },
        {
          breakpoint: 1200,
          settings: {
            slidesToShow: 4,
          },
        },
        {
          breakpoint: 768,
          settings: {
            slidesToShow: 3,
          },
        },
        {
          breakpoint: 576,
          settings: {
            slidesToShow: 2,
          },
        },
      ],
    });
  }

  //nice select
  $(document).ready(function () {
    $("select:not(.ignore)").niceSelect();
  });

  //Sortable Masonary with Filters
  function enableMasonry() {
    if ($(".sortable-masonry").length) {
      var winDow = $(window);
      // Needed variables
      var $container = $(".sortable-masonry .items-container");
      var $filter = $(".filter-btns");

      $container.isotope({
        filter: "*",
        masonry: {
          columnWidth: ".masonry-item.small-column",
        },
        animationOptions: {
          duration: 500,
          easing: "linear",
        },
      });

      // Isotope Filter
      $filter.find("li").on("click", function () {
        var selector = $(this).attr("data-filter");

        try {
          $container.isotope({
            filter: selector,
            animationOptions: {
              duration: 500,
              easing: "linear",
              queue: false,
            },
          });
        } catch (err) {}
        return false;
      });

      winDow.on("resize", function () {
        var selector = $filter.find("li.active").attr("data-filter");

        $container.isotope({
          filter: selector,
          animationOptions: {
            duration: 500,
            easing: "linear",
            queue: false,
          },
        });
      });

      var filterItemA = $(".filter-btns li");

      filterItemA.on("click", function () {
        var $this = $(this);
        if (!$this.hasClass("active")) {
          filterItemA.removeClass("active");
          $this.addClass("active");
        }
      });
    }
  }

  enableMasonry();

  // Progress Bar
  if ($(".count-bar").length) {
    $(".count-bar").appear(
      function () {
        var el = $(this);
        var percent = el.data("percent");
        $(el).css("width", percent).addClass("counted");
      },
      { accY: -50 }
    );
  }

  // Scroll top button
  $(".scroll-top-inner").on("click", function () {
    $("html, body").animate({ scrollTop: 0 }, 500);
    return false;
  });

  function handleScrollbar() {
    const bHeight = $("body").height();
    const scrolled = $(window).innerHeight() + $(window).scrollTop();

    let percentage = (scrolled / bHeight) * 100;

    if (percentage > 100) percentage = 100;

    $(".scroll-top-inner .bar-inner").css("width", percentage + "%");
  }

  // page direction
  function directionswitch() {
    if ($(".page_direction").length) {
      $(".direction_switch button").on("click", function () {
        $(".boxed_wrapper").toggleClass(function () {
          return $(this).is(".rtl, .ltr") ? "rtl ltr" : "rtl";
        });
      });
    }
  }

  // Scroll to a Specific Div
  if ($(".scroll-to-target").length) {
    $(".scroll-to-target").on("click", function () {
      var target = $(this).attr("data-target");
      // animate
      $("html, body").animate(
        {
          scrollTop: $(target).offset().top,
        },
        1000
      );
    });
  }

  // ------------------------------- AOS Animation
  if ($("[data-aos]").length) {
    AOS.init({
      duration: 1000,
      mirror: true,
    });
  }

  if ($(".curved-circle").length) {
    $(".curved-circle").circleType({
      position: "absolute",
      dir: 1.28,
      radius: 68,
      forceHeight: true,
      forceWidth: true,
    });
  }

  //Project Tabs
  if ($(".project-tab").length) {
    $(".project-tab .product-tab-btns .p-tab-btn").on("click", function (e) {
      e.preventDefault();
      var target = $($(this).attr("data-tab"));

      if ($(target).hasClass("actve-tab")) {
        return false;
      } else {
        $(".project-tab .product-tab-btns .p-tab-btn").removeClass(
          "active-btn"
        );
        $(this).addClass("active-btn");
        $(".project-tab .p-tabs-content .p-tab").removeClass("active-tab");
        $(target).addClass("active-tab");
      }
    });
  }

  $(".default_option").click(function () {
    $(this).parent().toggleClass("active");
  });

  $(".select_ul li").click(function () {
    var currentele = $(this).html();
    $(".default_option li").html(currentele);
    $(this).parents(".select_wrap").removeClass("active");
  });

  /*	=========================================================================
  When document is on ready, do
  ========================================================================== */

  jQuery(document).on("ready", function () {
    (function ($) {
      // add your functions
      directionswitch();
    })(jQuery);
  });

  /* ==========================================================================
   When document is Scrollig, do
   ========================================================================== */

  $(window).on("scroll", function () {
    headerStyle();
  });

  /* ==========================================================================
   When document is loaded, do
   ========================================================================== */

  $(window).on("load", function () {
    enableMasonry();

    $(".preloader").fadeOut();
  });

  /* ==================== Dynamically Add BG Image JS Start ====================== */
  $(".bg-img").css("background-image", function () {
    return `url(${$(this).data("background-image")})`;
  });
  /* ==================== Dynamically Add BG Image JS End ========================= */

  /* ==================== Password Toggle JS Start ================================ */
  $(".input--group-password").each(function (index, inputGroup) {
    let inputGroupBtn = $(inputGroup).find(".input-group-btn");
    let formControl = $(inputGroup).find(".form-control.form--control");

    inputGroupBtn.on("click", function () {
      if (formControl.attr("type") === "password") {
        formControl.attr("type", "text");
        $(this).find("i").removeClass("fa-eye-slash").addClass("fa-eye");
      } else {
        formControl.attr("type", "password");
        $(this).find("i").removeClass("fa-eye").addClass("fa-eye-slash");
      }
    });
  });
  /* ==================== Password Toggle JS End ================================== */

  /* ==================== Input Group Copy JS Start =============================== */
  $(".input--group-copy").each((index, element) => {
    let copyBtn = $(element).find(".copy-btn");
    let copyInput = $(element).find(".copy-input");

    copyBtn.on("click", function () {
      // Select the text field
      copyInput.select();
      copyInput[0].setSelectionRange(0, 99999); // For mobile devices

      // Copy the text inside the text field
      if (navigator.clipboard.writeText(copyInput.val())) {
        $(this).addClass("copied");

        let timer = setTimeout(() => {
          $(this).removeClass("copied");
          clearTimeout(timer);
        }, 1000);
      }
    });
  });
  /* ==================== Input Group Copy JS End ================================= */

  /* ==================== Offcanvas Sidebar JS Start ======================== */
  $('[data-toggle="offcanvas-sidebar"]').each(function (index, toggler) {
    let id = $(toggler).data("target");
    let sidebar = $(id);
    let sidebarClose = sidebar.find(".btn--close");
    let sidebarOverlay = $(".sidebar-overlay");

    let hideSidebar = function () {
      sidebar.removeClass("show");
      sidebarOverlay.removeClass("show");
      $(toggler).removeClass("active");
      $("body").removeClass("scroll-hide");
      $(document).unbind("keydown", EscSidbear);
    };

    let EscSidbear = function (e) {
      if (e.keyCode === 27) {
        hideSidebar();
      }
    };

    let showSidebar = function () {
      $(toggler).addClass("active");
      sidebar.addClass("show");
      sidebarOverlay.addClass("show");
      $("body").addClass("scroll-hide");
      $(document).on("keydown", EscSidbear);
    };

    $(toggler).on("click", showSidebar);
    $(sidebarOverlay).on("click", hideSidebar);
    $(sidebarClose).on("click", hideSidebar);
  });
  /* ==================== Offcanvas Sidebar JS End ========================== */
  /* ==================== Dashboard Body Scrolling Class JS Start ==================== */
  $(".dashboard-sidebar__body").on("scroll", function () {
    if ($(this).scrollTop() > 0) {
      $(this).addClass("scrolling");
    } else {
      $(this).removeClass("scrolling");
    }
  });
  /* ==================== Dashboard Body Scrolling Class JS End ==================== */

  $(".treeview").treeView();

  $("[data-highlight-word]").each((index, el) => {
    var text = $(el).text().replace(/\s+/g, " ").trim();

    // Define the range (1-based index)
    var startWord =
      $(el).data("highlight-start") || $(el).data("highlight-word");
    var endWord = $(el).data("highlight-word");

    // Split the string into words
    var words = text.split(" ");

    // Build the result
    var result = "";

    for (var i = 0; i < words.length; i++) {
      if (i === startWord - 1) {
        result += `<span>`;
      }

      result += words[i];

      if (i === endWord - 1) {
        result += "</span>";
      }

      // Add space between words (except after last word)
      if (i < words.length - 1) {
        result += " ";
      }
    }

    // Set the result to an element
    $(el).html(result);
  });
})(window.jQuery);
