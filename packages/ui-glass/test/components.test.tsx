import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { AmbientGlow, GlassCard, GlassCommandPalette, GlassDataState, GlassDialog, GlassDropdown, GlassHeader, GlassModal, GlassNotification, GlassPopover, GlassSidebar, GlassSurface } from '../components';

const html = (node: Parameters<typeof renderToStaticMarkup>[0]) => renderToStaticMarkup(node);
test('surfaces preserve semantic landmarks, attributes and styling', () => {
  assert.match(html(<GlassSurface aria-label="surface">content</GlassSurface>), /class="glass-surface/);
  assert.match(html(<GlassCard>card</GlassCard>), /^<article/);
  assert.match(html(<GlassHeader>header</GlassHeader>), /^<header/);
  assert.match(html(<GlassSidebar>navigation</GlassSidebar>), /^<aside/);
  assert.match(html(<AmbientGlow/>), /aria-hidden="true"/);
  assert.match(html(<GlassNotification>notice</GlassNotification>), /role="status"/);
});
test('dialog labels, native semantics and command palette input are accessible', () => {
  const close = () => {};
  const markup = html(<GlassDialog open={false} title="Security" onClose={close}>content</GlassDialog>);
  assert.match(markup, /<dialog/);
  assert.match(markup, /aria-labelledby=/);
  assert.match(markup, /aria-label="Đóng"/);
  assert.equal(GlassModal, GlassDialog);
  const palette = html(<GlassCommandPalette open={false} onClose={close} commands={[{label:'Nhân sự',action:close}]}/>);
  assert.match(palette, /<label for=/);
  assert.match(palette, /type="search"/);
  assert.match(palette, /Nhân sự/);
});
test('popover and dropdown use native disclosure semantics', () => {
  for (const component of [GlassPopover, GlassDropdown]) {
    const markup = html(createElement(component, {label:'Phạm vi', children:'Chưa kết nối'}));
    assert.match(markup, /^<details/);
    assert.match(markup, /<summary>Phạm vi<\/summary>/);
    assert.match(markup, /Chưa kết nối/);
  }
});
test('data states announce loading and errors and preserve supplied content', () => {
  assert.match(html(<GlassDataState status="loading"/>), /role="status"/);
  assert.match(html(<GlassDataState status="loading" locale="en"/>), /Loading data/);
  assert.match(html(<GlassDataState status="error" message="Failure" locale="en"/>), /Unable to load data/);
  assert.match(html(<GlassDataState status="empty" message="Chưa kết nối"/>), /Chưa kết nối/);
  assert.match(html(<GlassDataState status="error" message="Lỗi"/>), /role="alert"/);
  assert.match(html(<GlassDataState status="ready"><strong>actual content</strong></GlassDataState>), /actual content/);
});
