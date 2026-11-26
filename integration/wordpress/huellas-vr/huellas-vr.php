<?php
/**
 * Plugin Name: HUELLAS VR
 * Description: Inserta la experiencia educativa 3D de dinosaurios chilenos mediante el shortcode [huellas_vr].
 * Version: 1.0.0
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * License: GPL-2.0-or-later
 * Text Domain: huellas-vr
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Renderiza la aplicación aislada en un iframe adaptable.
 *
 * Uso: [huellas_vr] o [huellas_vr height="820"]
 */
function huellas_vr_shortcode($atts = array()) {
    $atts = shortcode_atts(
        array(
            'height' => '820',
            'title' => 'HUELLAS VR — Exploración de dinosaurios chilenos',
        ),
        $atts,
        'huellas_vr'
    );

    $height = absint($atts['height']);
    $height = min(1200, max(480, $height ? $height : 820));
    $title = sanitize_text_field($atts['title']);
    $app_file = plugin_dir_path(__FILE__) . 'app/index.html';

    if (!file_exists($app_file)) {
        if (current_user_can('manage_options')) {
            return '<p>' . esc_html__('HUELLAS VR: falta el paquete de la aplicación. Reinstala el ZIP completo del plugin.', 'huellas-vr') . '</p>';
        }
        return '';
    }

    $app_url = plugins_url('app/index.html', __FILE__);

    return sprintf(
        '<div class="huellas-vr-embed" style="width:100%%;max-width:100%%;margin:0 auto;overflow:hidden;border-radius:14px;">' .
        '<iframe src="%1$s" title="%2$s" loading="lazy" allow="accelerometer; gyroscope; fullscreen" allowfullscreen ' .
        'referrerpolicy="strict-origin-when-cross-origin" style="display:block;width:100%%;height:%3$dpx;min-height:480px;border:0;background:#101a18;"></iframe>' .
        '</div>',
        esc_url($app_url),
        esc_attr($title),
        $height
    );
}
add_shortcode('huellas_vr', 'huellas_vr_shortcode');
