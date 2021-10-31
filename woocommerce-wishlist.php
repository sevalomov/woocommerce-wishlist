<?php

/*
    Plugin Name: WooCommerce Wishlist
    Description: WooCommerce Wishlists allows guests and customers to create and add products to an unlimited number of Wishlists. 
    From birthdays to weddings and everything in between, WooCommerce Wishlists is a welcome addition to any WooCommerce store
    Author: Craftowe
     Author URI: https://craftowe.pl
    Version: 1.0
*/

if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

add_action('init', 'plugin_init');
function plugin_init()
{
    if (class_exists("Woocommerce")) {

        function wishlist_plugin_scripts_styles()
        {
            wp_enqueue_style('wishlist-style', plugins_url('/css/style-wishlist.css', __FILE__), array(), '1.0.0');
            wp_enqueue_script('wishlist-main', plugins_url('/js/main-wishlist.js', __FILE__), array('jquery'), '', true);
            wp_localize_script(
                'wishlist-main',
                'opt',
                array(
                    'ajaxUrl'        => admin_url('admin-ajax.php'),
                    'ajaxPost'       => admin_url('admin-post.php'),
                    'restUrl'        => rest_url('wp/v2/product'),
                    'shopName'       => sanitize_title_with_dashes(sanitize_title_with_dashes(get_bloginfo('name'))),
                    'inWishlist'     => esc_html__("AJuż na liście życzeń", "text-domain"),
                    'addToWishlist'  => esc_html__("Dodaj do listy życzeń", "text-domain"),
                    'removeWishlist' => esc_html__("Usuń z listy życzeń", "text-domain"),
                    'productAlertText' => esc_html__("został dodany do ‪Lista zakupów‬.", "text-domain"),
                    'productAlertTextRemove' => esc_html__("został usunięty z Lista zakupów.", "text-domain"),
                    'buttonText'     => esc_html__("Szczegóły", "text-domain"),
                    'buttonTextСontinue'   => esc_html__("Kontynuj zakupy", "text-domain"),
                    'error'          => esc_html__("Coś poszło nie tak, nie można dodać do listy życzeń", "text-domain"),
                    'noWishlist'     => esc_html__("Nie znaleziono listy życzeń", "text-domain"),
                    'ofertaText'     => esc_html__("Jakie są Twoje ulubione? Zachowaj i uporządkuj tutaj najlepsze elementy Twojego przyszłego domu, dopóki nie będziesz na nie gotowy.", "text-domain"),
                    'ofertaTextH3'   => esc_html__("Twoja lista życzeń wygląda na pustą!", "text-domain"),
                    // Add here the texts for the buttons and what the json in our plugin 
                    // will write out, this will allow the translator to translate our plugin and put everything in its place
                )
            );
        }

        add_action('wp_enqueue_scripts', 'wishlist_plugin_scripts_styles');

        // Get current user data
        function fetch_user_data()
        {
            if (is_user_logged_in()) {
                $current_user = wp_get_current_user();
                $current_user_wishlist = get_user_meta($current_user->ID, 'wishlist', true);
                echo json_encode(array('user_id' => $current_user->ID, 'wishlist' => $current_user_wishlist));
            }
            die();
        }
        add_action('wp_ajax_fetch_user_data', 'fetch_user_data');
        add_action('wp_ajax_nopriv_fetch_user_data', 'fetch_user_data');

        // Add wishlist to product
        add_action('woocommerce_before_shop_loop_item_title', 'wishlist_toggle', 15);
        add_action('woocommerce_single_product_summary', 'wishlist_toggle', 25);
        function wishlist_toggle()
        {
            global $product;
            $id_product = $product->get_id();
            $sale = $product->get_sale_price();
            $regular = $product->get_regular_price();
            $regular = number_format((float)$regular, 2, '.', '');
            $sale = number_format((float)$sale, 2, '.', '');
            if ($sale > 0) {$price = $sale; }else{ $price = $regular;}
            $photo = get_the_post_thumbnail_url($id_product); 
           
            echo '<span class="wishlist-title">' . esc_attr__("Dodaj do listy życzeń", "text-domain") . '</span><a class="wishlist-toggle heart-like-product" data-product="' . esc_attr($id_product) . '" data-product-permalink="' . esc_attr($product->get_permalink()) . '" data-product-title="' . esc_attr($product->get_title()) . '" data-product-price="' . esc_attr($price) . '" data-product-permalink-imagephoto
            ="' . esc_attr($photo) . '" href="#" title="' . esc_attr__("Dodaj do listy życzeń", "text-domain") . '"><i class="far fa-heart"></i></a>';
        }

        // Wishlist option in the user profile
        add_action('show_user_profile', 'wishlist_user_profile_field');
        add_action('edit_user_profile', 'wishlist_user_profile_field');
        function wishlist_user_profile_field($user)
        { ?>
            <table class="form-table wishlist-data">
                <tr>
                    <th><?php echo esc_attr__("Wishlist", "text-domain"); ?></th>
                    <td>
                        <input type="text" name="wishlist" id="wishlist" value="<?php echo esc_attr(get_the_author_meta('wishlist', $user->ID)); ?>" class="regular-text" />
                    </td>
                </tr>
            </table>
<?php }

        add_action('personal_options_update', 'save_wishlist_user_profile_field');
        add_action('edit_user_profile_update', 'save_wishlist_user_profile_field');
        function save_wishlist_user_profile_field($user_id)
        {
            if (!current_user_can('edit_user', $user_id)) {
                return false;
            }
            update_user_meta($user_id, 'wishlist', $_POST['wishlist']);
        }

        function update_wishlist_ajax()
        {
            if (isset($_POST["user_id"]) && !empty($_POST["user_id"])) {
                $user_id   = $_POST["user_id"];
                $user_obj = get_user_by('id', $user_id);
                if (!is_wp_error($user_obj) && is_object($user_obj)) {
                    update_user_meta($user_id, 'wishlist', $_POST["wishlist"]);
                }
            }
            die();
        }


        add_action('admin_post_nopriv_user_wishlist_update', 'update_wishlist_ajax');
        add_action('admin_post_user_wishlist_update', 'update_wishlist_ajax');

        // Wishlist table shortcode
        add_shortcode('wishlist', 'wishlist');
        function wishlist($atts, $content = null)
        {
            extract(shortcode_atts(array(), $atts));
            return '<div class="row g-4 py-2 row-cols-1 row-cols-lg-3 wishlist-table">
              
                    </div>';
        }

        // Extend REST API
        function rest_register_fields()
        {

            register_rest_field(
                'product',
                'price',
                array(
                    'get_callback'    => 'rest_price',
                    'update_callback' => null,
                    'schema'          => null
                )
            );

            register_rest_field(
                'product',
                'stock',
                array(
                    'get_callback'    => 'rest_stock',
                    'update_callback' => null,
                    'schema'          => null
                )
            );

            register_rest_field(
                'product',
                'image',
                array(
                    'get_callback'    => 'rest_img',
                    'update_callback' => null,
                    'schema'          => null
                )
            );
        }


        add_action('rest_api_init', 'rest_register_fields');

        function rest_price($object, $field_name, $request)
        {

            global $product;

            $id = $product->get_id();

            if ($id == $object['id']) {
                return $product->get_price();
            }
        }

        function rest_stock($object, $field_name, $request)
        {

            global $product;

            $id = $product->get_id();

            if ($id == $object['id']) {
                return $product->get_stock_status();
            }
        }

        function rest_img($object, $field_name, $request)
        {

            global $product;

            $id = $product->get_id();

            if ($id == $object['id']) {
                return $product->get_image();
            }
        }

        function maximum_api_filter($query_params)
        {
            $query_params['per_page']["maximum"] = 100;
            return $query_params;
        }
        add_filter('rest_product_collection_params', 'maximum_api_filter');
    }
}
?>