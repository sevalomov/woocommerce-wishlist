
(function ($) {

    "use strict";

    /*
        1. Add product to wishlist
        2. Display wishlist items in the table
        3. Remove product from the wishlist
    */

    Array.prototype.unique = function () {
        return this.filter(function (value, index, self) {
            return self.indexOf(value) === index;
        });
    }

    function isInArray(value, array) { return array.indexOf(value) > -1; }

    var emptyWishlistText = '<div class="col-12 empty-wishlist"><h3 class="pt-2 pb-2">' + opt.ofertaTextH3 + '</h3><p>' + opt.ofertaText + '</p><a  data-dismiss="modal" class="cont-shop" aria-label="Close">' + opt.buttonTextСontinue + '</a></div>';

    // Bootstrap Alert Auto Close
    function showAlert(target) {
        var allertAdToWishlist = '<div class="shadow-lg allertAdToWishlist' + target.data('product') + ' custom-alert alert alert-dismissible fade show" role="alert"> <strong>' + target.data('product-title') + '</strong> ' + opt.productAlertText + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true"><i class="fas fa-times"></i></span> </button> </div>';
        $('body').prepend(allertAdToWishlist);

        window.setTimeout(function () {
            $(".allertAdToWishlist" + target.data('product')).fadeTo(500, 0).slideUp(500, function () {
                $(this).remove();
            });
        }, 2000);
    }

    function showAlertRemove(target) {
        var allertRemoveFromWishlist = '<div class="shadow-lg allertRemoveFromWishlist' + target.data('product') + ' custom-alert alert alert-dismissible fade show" role="alert"> <strong>' + target.data('product-title') + '</strong> ' + opt.productAlertTextRemove + ' <button type="button" class="close" data-dismiss="alert" aria-label="Close"> <span aria-hidden="true"><i class="fas fa-times"></i></span> </button> </div>';
        $('body').prepend(allertRemoveFromWishlist);

        window.setTimeout(function () {
            $(".allertRemoveFromWishlist" + target.data('product')).fadeTo(500, 0).slideUp(500, function () {
                $(this).remove();
            });
        }, 2000);
    }


    function onWishlistComplete(target, title) {
        setTimeout(function () {
            target
                .removeClass('loading')
                .addClass('active')
                .attr('title', title);
            // console.log('Product added from the wish list')
        }, 800);
        

        if (wishlist.toString()) {
            console.log(wishlist)
            $( ".empty-wishlist" ).remove();
        }
        
        $('.wishlist-table').append('<div class="col wish-block d-flex align-items-start" data-product="' + target.data('product') + '"> <div class="icon-square bg-light text-dark flex-shrink-0 mr-3">  ' + target.data('product-permalink-image') + ' </div> <div> <h3>' + target.data('product-title') + '</h3> <h4>' + target.data('product-price') + '</h4><a class="details" href="' + target.data('product-permalink') + '"> </a><a class="wishlist-remove" href="#" title="' + target.data('product-permalink') + '"></a> </div>').hide().fadeIn();
    }


    function removeFromPopupProduct(currentProduct, wishlist) {
        // If you do in the papa wish list, this function deletes products in live time
        $('.col[data-product="' + currentProduct + '"]').remove();

        console.log(wishlist)
        if (!wishlist.toString()) {
            setTimeout(function () {
                $('.wishlist-table').append(emptyWishlistText).hide().fadeIn();
            }, 1000);
        }

    }



    function removefromWishlistComplete(target, title) {
        setTimeout(function () {
            target
                .removeClass('loading')
                .remove('active')
                .attr('title', title);
            // console.log('Product removed from the wish list')
        }, 800);
    }

    function highlightWishlist(wishlist, title) {
        $('.wishlist-toggle').each(function () {
            var $this = $(this);
            var currentProduct = $this.data('product');
            currentProduct = currentProduct.toString();
            if (isInArray(currentProduct, wishlist)) {
                $this.addClass('active').attr('title', title);
            }
        });
    }

    var shopName = opt.shopName + '-wishlist',
        inWishlist = opt.inWishlist,
        addToWishlist = opt.addToWishlist,
        restUrl = opt.restUrl,
        wishlist = new Array,
        ls = sessionStorage.getItem(shopName),
        loggedIn = ($('body').hasClass('logged-in')) ? true : false,
        userData = '';

    if (loggedIn) {
        // Fetch current user data

        $.ajax({
            type: 'POST',
            url: opt.ajaxUrl,
            data: {
                'action': 'fetch_user_data',
                'dataType': 'json'
            },
            success: function (data) {
                userData = JSON.parse(data);
                if (typeof (userData['wishlist']) != 'undefined' && userData['wishlist'] != null && userData['wishlist'] != "") {

                    var userWishlist = userData['wishlist'];
                    userWishlist = userWishlist.split(',');

                    if (wishlist.length) {
                        wishlist = wishlist.concat(userWishlist);

                        $.ajax({
                            type: 'POST',
                            url: opt.ajaxPost,
                            data: {
                                action: 'user_wishlist_update',
                                user_id: userData['user_id'],
                                wishlist: wishlist.join(','),
                            }
                        });
                    } else {
                        wishlist = userWishlist;
                    }

                    wishlist = wishlist.unique();
                    highlightWishlist(wishlist, inWishlist);
                    sessionStorage.removeItem(shopName);

                } else {
                    if (typeof (ls) != 'undefined' && ls != null) {
                        ls = ls.split(',');
                        ls = ls.unique();
                        wishlist = ls;
                    }

                    $.ajax({
                        type: 'POST',
                        url: opt.ajaxPost,
                        data: {
                            action: 'user_wishlist_update',
                            user_id: userData['user_id'],
                            wishlist: wishlist.join(','),
                        }
                    })
                        .done(function (response) {
                            highlightWishlist(wishlist, inWishlist);
                            sessionStorage.removeItem(shopName);
                        });
                }
            },
            error: function () {
                // console.log('No user data returned');
            }
        });
    } else {
        if (typeof (ls) != 'undefined' && ls != null) {
            ls = ls.split(',');
            ls = ls.unique();
            wishlist = ls;
        }
    }


    $('.wishlist-toggle').each(function () {
        // var wishlistTable = $('.wishlist-table');
        var $this = $(this);

        var currentProduct = $this.data('product');


        currentProduct = currentProduct.toString();

        if (!loggedIn && isInArray(currentProduct, wishlist)) {
            $this.addClass('active').attr('title', inWishlist);
        }

        $(this).on('click', function (e) {
            e.preventDefault();


            if (!$this.hasClass('active') && !$this.hasClass('loading')) {
                /* 
                I add the class 'active' because I want 
                to immediately paint the heart in black, 
                if you want to insert a loading animation, then you need to add the class 
                loading' and add a load icon with animation in HTML / CSS I think it is not difficult ;) 
                */
                $this.addClass('loading');

                wishlist.push(currentProduct);
                wishlist = wishlist.unique();

                if (loggedIn) {
                    // get user ID
                    if (userData['user_id']) {
                        $.ajax({
                            type: 'POST',
                            url: opt.ajaxPost,
                            data: {
                                action: 'user_wishlist_update',
                                user_id: userData['user_id'],
                                wishlist: wishlist.join(','),
                            }
                        })
                            .done(function (response) {
                                onWishlistComplete($this, opt.inWishlist);
                                showAlert($this);
                            })
                            .fail(function (data) {
                                alert(opt.error);
                            });
                    }
                } else {
                    sessionStorage.setItem(shopName, wishlist.toString());
                    onWishlistComplete($this, inWishlist);
                    showAlert($this);
                }

            } else if ($this.hasClass('active') && !$this.hasClass('loading')) {
                //Hear we are remove from wishlist (click on page)
                $this.addClass('loading');
                $this.removeClass('active');


                const index = wishlist.indexOf(currentProduct);
                if (index > -1) {
                    wishlist.splice(index, 1);
                }

                wishlist = wishlist.unique();


                if (loggedIn) {
                    if (userData['user_id']) {
                        $.ajax({
                            type: 'POST',
                            url: opt.ajaxPost,
                            data: {
                                action: 'user_wishlist_update',
                                user_id: userData['user_id'],
                                wishlist: wishlist.join(','),
                            }
                        })
                            .done(function (response) {
                                showAlertRemove($this);
                                removefromWishlistComplete($this, opt.addToWishlist);
                                removeFromPopupProduct(currentProduct, wishlist);
                                
                            })
                            .fail(function (data) {
                                alert(opt.error);
                            });
                    }
                } else {
                    sessionStorage.setItem(shopName, wishlist.toString());
                    showAlertRemove($this);
                    removefromWishlistComplete($this, opt.addToWishlist);
                    removeFromPopupProduct(currentProduct, wishlist);
                }
            }


        });
    });



    $('[data-target="#wishlistModal"]').one("click", function () {
        // Whatever you want to execute after click

        $('.wishlist-table').addClass('loading');

        setTimeout(function () {

            if (wishlist.toString()) {
                restUrl += '?include=' + wishlist.join(',');
                restUrl += '&per_page=' + wishlist.length;
                $.ajax({
                    dataType: 'json',
                    url: restUrl
                })
                    .done(function (response) {
                        $('.wishlist-table').each(function () {

                            var $this = $(this);
                            $(".wishlist-table").empty();

                            $.each(response, function (index, object) {
                                $('.wishlist-table').append('<div class="col wish-block d-flex align-items-start" data-product="' + object.id + '"> <div class="icon-square bg-light text-dark flex-shrink-0 mr-3"> ' + object.image + ' </div> <div> <h3>' + object.title["rendered"] + '</h3> <h4>' + object.price + '</h4> <a class="details" href="' + object.link + '"></a><a class="wishlist-remove" href="#" title="' + opt.removeWishlist + '"></a> </div>').hide().fadeIn();
                            });

                        });
                    })

                    .fail(function (response) {
                        // alert(opt.noWishlist);
                    })

                    .always(function (response) {
                        $('.wishlist-table').each(function () {
                            $(this).removeClass('loading');
                        });
                    });

            } else {
                $(" .wishlist-table").empty();
                $('.wishlist-table').each(function () {
                    $(this).removeClass('loading');
                });
                setTimeout(function () {
                    $('.wishlist-table').append(emptyWishlistText).hide().fadeIn();
                }, 100);
            }
        }, 1000);

    });


    $(document).on('click', '.wishlist-remove', function () {

        var $this = $(this);
        var idForRemoveClassActive = $this.closest('.col').data('product');

        $('[data-product="' + idForRemoveClassActive + '"]').removeClass('active');

        $this.closest('.wishlist-table').addClass('loading');
        idForRemoveClassActive = idForRemoveClassActive.toString();

        
        const index = wishlist.indexOf(idForRemoveClassActive);
        if (index > -1) {
            wishlist.splice(index, 1);
        }

        if (!wishlist.toString()) {
            setTimeout(function () {
                $('.wishlist-table').append(emptyWishlistText).hide().fadeIn();
            }, 1000);
        }

        if (loggedIn) {
            // get user ID
            if (userData['user_id']) {
                $.ajax({
                    type: 'POST',
                    url: opt.ajaxPost,
                    data: {
                        action: 'user_wishlist_update',
                        user_id: userData['user_id'],
                        wishlist: wishlist.join(','),
                    }
                })
                    .done(function (response) {

                        $this.closest('.wishlist-table').removeClass('loading');
                        $this.closest('.col').fadeOut('mormal', function () { $this.closest('.col').remove(); });
                        
                    })
                    .fail(function (data) {
                        alert(opt.error);
                    });
            }
        } else {

            if (wishlist.toString()) {
                sessionStorage.setItem(shopName, wishlist.toString());
            } else {
                sessionStorage.setItem(shopName, ',');
            }
            setTimeout(function () {
                $this.closest('.wishlist-table').removeClass('loading');
                $this.closest('.col').remove();
            }, 900);
        }
    });


})(jQuery);

