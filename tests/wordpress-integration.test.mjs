import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";

const plugin = await readFile(new URL("../integration/wordpress/huellas-vr/huellas-vr.php", import.meta.url), "utf8");
const workflow = await readFile(new URL("../.github/workflows/quality.yml", import.meta.url), "utf8");
const integrationGuide = await readFile(new URL("../integration/wordpress/huellas-vr/README.md", import.meta.url), "utf8");

test("el plugin WordPress registra el shortcode oficial", () => {
  assert.match(plugin, /add_shortcode\('huellas_vr', 'huellas_vr_shortcode'\)/);
  assert.match(plugin, /function huellas_vr_shortcode/);
});

test("el iframe carga los archivos empaquetados y habilita sensores Cardboard", () => {
  assert.match(plugin, /plugins_url\('app\/index\.html', __FILE__\)/);
  assert.match(plugin, /allow="accelerometer; gyroscope; fullscreen"/);
  assert.match(plugin, /allowfullscreen/);
  assert.match(plugin, /esc_url\(\$app_url\)/);
  assert.match(plugin, /esc_attr\(\$title\)/);
});

test("la altura del iframe se limita a un rango seguro", () => {
  assert.match(plugin, /min\(1200, max\(480,/);
});

test("CI empaqueta la aplicación compilada y el plugin instalable", () => {
  assert.match(workflow, /cp -R dist\/. release\/huellas-vr\/app\//);
  assert.match(workflow, /huellas-vr-wordpress\.zip/);
  assert.match(workflow, /huellas-vr-wordpress-plugin/);
  assert.match(integrationGuide, /\[huellas_vr\]/);
});
