'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, FormEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';

interface NewsItem {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  imageUrl: string | null;
  published: boolean;
  publishedAt: string | null;
}

interface FormState {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  published: boolean;
  publishedAt: string;
}

const emptyForm: FormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  imageUrl: '',
  published: false,
  publishedAt: new Date().toISOString().slice(0, 10),
};

function formatDate(value?: string | null) {
  if (!value) return 'Без даты';
  return new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function formatLongDate(value?: string | null) {
  if (!value) return 'Без даты';
  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(value));
}

function prepareDateInput(value?: string | null) {
  if (!value) return new Date().toISOString().slice(0, 10);
  return new Date(value).toISOString().slice(0, 10);
}

function makeLocalSlug(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/ё/g, 'е')
    .replace(/[^a-zа-я0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function ToolbarButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-9 rounded-none px-4 text-sm font-black transition ${
        active ? 'bg-black text-white' : 'bg-transparent text-black hover:bg-black/5'
      }`}
    >
      {children}
    </button>
  );
}

function EditIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 20h9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 6h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 6V4h8v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 6l-1 14H6L5 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v5M14 11v5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function AdminNewsPage() {
  const router = useRouter();
  const [items, setItems] = useState<NewsItem[]>([]);
  const [selected, setSelected] = useState<NewsItem | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'list' | 'edit' | 'preview'>('list');
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      ImageExtension.configure({ inline: false, allowBase64: false }),
      LinkExtension.configure({ openOnClick: false, autolink: true, defaultProtocol: 'https' }),
    ],
    content: form.content,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'admin-news-editor min-h-[310px] rounded-b-md border-x border-b border-black/20 bg-white p-4 text-[15px] leading-7 outline-none',
      },
    },
    onUpdate({ editor: currentEditor }) {
      setForm((current) => ({ ...current, content: currentEditor.getHTML() }));
    },
  });

  async function loadNews() {
    setLoading(true);
    setMessage('');
    try {
      const response = await fetch('/api/news?all=1', { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Не удалось загрузить новости');
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadNews();
  }, []);

  useEffect(() => {
    const slug = new URLSearchParams(window.location.search).get('edit');
    if (!slug || !items.length || selected?.slug === slug) return;
    const item = items.find((newsItem) => newsItem.slug === slug);
    if (item) startEdit(item);
  }, [items, selected?.slug]);

  const filtered = useMemo(() => {
    const prepared = query.trim().toLowerCase();
    if (!prepared) return items;
    return items.filter((item) => `${item.title} ${item.excerpt || ''} ${item.slug}`.toLowerCase().includes(prepared));
  }, [items, query]);

  function setEditorContent(content: string) {
    editor?.commands.setContent(content || '', false);
  }

  function goBack() {
    if (mode === 'list') {
      router.push('/admin');
      return;
    }

    setMode('list');
    setSelected(null);
    setMessage('');
  }

  function startCreate() {
    const next = { ...emptyForm, publishedAt: new Date().toISOString().slice(0, 10) };
    setSelected(null);
    setForm(next);
    setEditorContent(next.content);
    setMessage('');
    setMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function startEdit(item: NewsItem) {
    const next = {
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      content: item.content || '',
      imageUrl: item.imageUrl || '',
      published: item.published,
      publishedAt: prepareDateInput(item.publishedAt),
    };
    setSelected(item);
    setForm(next);
    setEditorContent(next.content);
    setMessage('');
    setMode('edit');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function updateTitle(value: string) {
    setForm((current) => ({
      ...current,
      title: value,
      slug: selected ? current.slug : makeLocalSlug(value),
    }));
  }

  function addImageToEditor() {
    const url = window.prompt('Вставьте ссылку на изображение');
    if (!url) return;
    editor?.chain().focus().setImage({ src: url }).run();
  }

  function selectCover() {
    coverInputRef.current?.click();
  }

  async function handleCoverFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage('Для обложки можно выбрать только изображение.');
      return;
    }

    setUploadingCover(true);
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'news');

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Не удалось загрузить изображение');

      setForm((current) => ({ ...current, imageUrl: String(data.url || '') }));
      setMessage('Обложка загружена. Не забудьте сохранить новость.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Неизвестная ошибка при загрузке изображения');
    } finally {
      setUploadingCover(false);
    }
  }

  function setLink() {
    const previousUrl = editor?.getAttributes('link').href || '';
    const url = window.prompt('Вставьте ссылку', previousUrl);
    if (url === null) return;
    if (!url.trim()) {
      editor?.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url.trim() }).run();
  }

  async function saveNews(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage('');

    const payload = {
      ...form,
      content: editor?.getHTML() || form.content,
    };

    try {
      const response = await fetch(selected ? `/api/news/${selected.slug}` : '/api/news', {
        method: selected ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Не удалось сохранить новость');
      setMessage(selected ? 'Новость обновлена.' : 'Новость создана.');
      await loadNews();
      setMode('list');
      setSelected(null);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setSaving(false);
    }
  }

  async function deleteNews(item: NewsItem) {
    const confirmed = window.confirm(`Удалить новость «${item.title}»?`);
    if (!confirmed) return;

    setSaving(true);
    setMessage('');
    try {
      const response = await fetch(`/api/news/${item.slug}`, { method: 'DELETE' });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Не удалось удалить новость');
      if (selected?.id === item.id) {
        setSelected(null);
        setMode('list');
      }
      setMessage('Новость удалена.');
      await loadNews();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f7f4] text-black">
      <header className="sticky top-0 z-40 h-[62px] border-b border-black/15 bg-[#f7f7f4]/95 backdrop-blur">
        <div className="relative flex h-full items-center justify-between px-4">
          <button
            type="button"
            onClick={goBack}
            className="inline-flex h-10 items-center gap-3 text-base font-black text-black hover:opacity-70"
          >
            <span className="text-3xl leading-none">←</span>
            Назад
          </button>

          <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-xl font-black text-black">
            Управление новостями
          </h1>

          <button
            type="button"
            onClick={startCreate}
            className="inline-flex h-[38px] items-center rounded-lg bg-black px-5 text-sm font-black text-white shadow-[0_8px_18px_rgba(17,17,17,0.18)]"
          >
            + Добавить новость
          </button>
        </div>
      </header>

      <main className="px-4 py-9">
        <div className="mx-auto max-w-none">
          {message && <div className="mb-5 rounded-md border border-black/10 bg-white p-4 text-sm font-bold text-black/70">{message}</div>}

          {mode === 'list' ? (
            <section>
              <div className="mb-7 flex items-center justify-between gap-4">
                <h2 className="text-3xl font-black leading-none text-black">Все новости</h2>
                <div className="text-sm text-black/65">Всего: {items.length}</div>
              </div>

              <div className="space-y-4">
                {loading && (
                  <div className="rounded-lg border border-black/15 bg-white p-6 text-sm text-black/60">Загрузка...</div>
                )}

                {!loading && filtered.map((item) => (
                  <article
                    key={item.id}
                    className="flex min-h-[170px] items-start gap-5 rounded-lg border border-black/15 bg-white px-6 py-6 shadow-[0_10px_26px_rgba(17,17,17,0.025)]"
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt="" className="mt-1 h-[80px] w-[112px] flex-shrink-0 rounded-md object-cover" />
                    ) : (
                      <div className="mt-1 flex h-[80px] w-[112px] flex-shrink-0 items-center justify-center rounded-md bg-black/5 text-xs font-bold text-black/35">Без фото</div>
                    )}

                    <div className="min-w-0 flex-1 pr-5">
                      <div className="flex flex-wrap items-center gap-2 text-sm text-black/60">
                        <span className="rounded-full bg-black/5 px-3 py-1 text-sm text-black">
                          ✓ {item.published ? 'Опубликовано' : 'Черновик'}
                        </span>
                        <span>☷ {formatLongDate(item.publishedAt)}</span>
                      </div>
                      <h3 className="mt-3 text-[22px] font-black leading-tight text-black">{item.title}</h3>
                      <p className="mt-2 line-clamp-2 text-base leading-6 text-black/65">{item.excerpt || 'Без описания'}</p>
                      <div className="mt-3 inline-flex max-w-full rounded bg-black/5 px-3 py-1 font-mono text-sm text-black/55">
                        <span className="truncate">/news/{item.slug}</span>
                      </div>
                    </div>

                    <div className="ml-auto flex min-w-[92px] items-start justify-end gap-5 pt-3 text-black/75">
                      <button
                        type="button"
                        onClick={() => startEdit(item)}
                        className="rounded-md p-2 hover:bg-black/5 hover:text-black"
                        title="Изменить"
                      >
                        <EditIcon />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteNews(item)}
                        className="rounded-md p-2 hover:bg-black/5 hover:text-black"
                        title="Удалить"
                      >
                        <TrashIcon />
                      </button>
                    </div>
                  </article>
                ))}

                {!loading && !filtered.length && (
                  <div className="rounded-lg border border-black/15 bg-white p-6 text-sm text-black/60">Новости не найдены.</div>
                )}
              </div>
            </section>
          ) : (
            <>
              <div className="mb-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setMode('edit')}
                  className={`inline-flex h-10 items-center rounded-md px-5 text-sm font-black shadow-[0_8px_18px_rgba(17,17,17,0.10)] ${mode === 'edit' ? 'bg-black text-white' : 'border border-black/15 bg-white text-black'}`}
                >
                  ✎ Редактирование
                </button>
                <button
                  type="button"
                  onClick={() => setMode('preview')}
                  className={`inline-flex h-10 items-center rounded-md px-5 text-sm font-black ${mode === 'preview' ? 'bg-black text-white' : 'border border-black/15 bg-white text-black'}`}
                >
                  👁 Предпросмотр
                </button>
              </div>

              {mode === 'edit' ? (
                <form onSubmit={saveNews} className="max-w-[1180px] rounded-md border border-black/15 bg-white p-5 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
                  <h2 className="text-xl font-black text-black">{selected ? 'Редактирование новости' : 'Новая новость'}</h2>

                  <div className="mt-6 space-y-4">
                    <div>
                      <label className="text-xs font-bold text-black">Заголовок</label>
                      <input
                        value={form.title}
                        onChange={(event) => updateTitle(event.target.value)}
                        className="mt-2 h-10 w-full rounded-md border border-black/20 bg-[#eeeeec] px-4 text-sm outline-none focus:border-black/45"
                        required
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-black">
                        Slug (URL) <span className="font-normal text-black/55">— это часть URL адреса страницы. Например: </span>
                        <span className="rounded bg-black/5 px-2 py-0.5 font-mono text-[11px]">/news/zagolovok-novosti</span>
                      </label>
                      <input
                        value={form.slug}
                        onChange={(event) => setForm({ ...form, slug: event.target.value })}
                        className="mt-2 h-10 w-full rounded-md border border-black/20 bg-[#eeeeec] px-4 text-sm outline-none focus:border-black/45 disabled:opacity-70"
                        placeholder="zagolovok-novosti"
                        disabled={Boolean(selected)}
                      />
                      <p className="mt-1 text-[11px] text-black/55">💡 Slug генерируется автоматически из заголовка, но вы можете изменить его вручную</p>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-black">Краткое описание</label>
                      <textarea
                        value={form.excerpt}
                        onChange={(event) => setForm({ ...form, excerpt: event.target.value })}
                        className="mt-2 min-h-[58px] w-full rounded-md border border-black/20 bg-[#eeeeec] p-4 text-sm outline-none focus:border-black/45"
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4 md:grid-cols-[220px_minmax(0,1fr)]">
                      <div>
                        <label className="text-xs font-bold text-black">Дата публикации</label>
                        <input
                          type="date"
                          value={form.publishedAt}
                          onChange={(event) => setForm({ ...form, publishedAt: event.target.value })}
                          className="mt-2 h-10 w-full rounded-md border border-black/20 bg-[#eeeeec] px-4 text-sm outline-none focus:border-black/45"
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold text-black">Обложка новости</label>
                        <input
                          ref={coverInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleCoverFileChange}
                        />
                        <div className="mt-2 rounded-md border border-black/20 bg-[#eeeeec] p-3">
                          <button
                            type="button"
                            onClick={selectCover}
                            disabled={uploadingCover}
                            className="group relative flex min-h-[92px] w-full items-center justify-center overflow-hidden rounded-md border border-dashed border-black/35 bg-white text-xs font-medium text-black/65 hover:bg-black/[0.02] disabled:cursor-wait disabled:opacity-60"
                          >
                            {form.imageUrl ? (
                              <>
                                <img src={form.imageUrl} alt="" className="absolute inset-0 h-full w-full object-contain bg-white opacity-70 transition group-hover:opacity-55" />
                                <span className="relative rounded-md bg-white/90 px-4 py-2 font-black text-black shadow-sm">
                                  {uploadingCover ? 'Загрузка...' : 'Изменить картинку для обложки'}
                                </span>
                              </>
                            ) : (
                              <span>{uploadingCover ? 'Загрузка...' : 'Выбрать картинку для обложки'}</span>
                            )}
                          </button>
                        </div>
                        <p className="mt-1 text-[11px] text-black/55">Нажмите на область, выберите файл с компьютера, потом сохраните новость.</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-black">Контент</label>
                      <div className="mt-2 rounded-t-md border border-black/20 bg-[#eeeeec]">
                        <div className="flex h-11 items-center gap-1 px-3">
                          <ToolbarButton active={editor?.isActive('bold')} onClick={() => editor?.chain().focus().toggleBold().run()}>B</ToolbarButton>
                          <ToolbarButton active={editor?.isActive('italic')} onClick={() => editor?.chain().focus().toggleItalic().run()}>/</ToolbarButton>
                          <ToolbarButton onClick={addImageToEditor}>Картинка в текст</ToolbarButton>
                          <ToolbarButton active={editor?.isActive('link')} onClick={setLink}>Ссылка</ToolbarButton>
                        </div>
                      </div>
                      <EditorContent editor={editor} />
                      <p className="mt-1 text-[11px] text-black/55">💡 Ссылки в тексте распознаются автоматически при вставке</p>
                    </div>

                    <label className="flex items-center gap-2 text-sm font-bold text-black">
                      <input
                        type="checkbox"
                        checked={form.published}
                        onChange={(event) => setForm({ ...form, published: event.target.checked })}
                        className="h-4 w-4"
                      />
                      Опубликовано
                    </label>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button disabled={saving} className="rounded-md bg-black px-6 py-3 text-sm font-black text-white disabled:opacity-50" type="submit">
                        {saving ? 'Сохранение...' : 'Сохранить'}
                      </button>
                      <button type="button" onClick={() => setMode('list')} className="rounded-md bg-black/5 px-6 py-3 text-sm font-black text-black hover:bg-black/10">
                        Отмена
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <section className="max-w-[1180px] rounded-md border border-black/20 bg-white p-5 shadow-[0_12px_30px_rgba(17,17,17,0.04)]">
                  <div className="mb-5 flex items-center justify-between gap-4">
                    <h2 className="text-xl font-black text-black">Предпросмотр новости</h2>
                    <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-bold text-black/45">
                      {form.published ? 'Опубликовано' : 'Черновик'}
                    </span>
                  </div>

                  <div className="rounded-md bg-[#1f1f1f] px-5 py-5 text-white">
                    <h3 className="text-3xl font-black leading-tight">{form.title || 'Заголовок новости'}</h3>
                    <div className="mt-3 text-sm font-bold text-white">{formatDate(form.publishedAt)}</div>
                  </div>

                  {form.imageUrl ? (
                    <img
                      src={form.imageUrl}
                      alt=""
                      className="mt-5 w-full rounded-md border border-black/10 bg-[#f5f5f2] object-contain"
                    />
                  ) : (
                    <div className="mt-5 flex min-h-[320px] w-full items-center justify-center rounded-md border border-dashed border-black/25 bg-[#f5f5f2] text-sm font-bold text-black/40">
                      Изображение новости
                    </div>
                  )}

                  <div className="mt-5 rounded-md border border-black/20 bg-[#f1f1ef] px-4 py-3 text-sm italic text-black">
                    {form.excerpt || 'Краткое описание новости...'}
                  </div>

                  <div
                    className="prose news-detail-content mt-5 max-w-none text-sm leading-7 text-black/70"
                    dangerouslySetInnerHTML={{ __html: editor?.getHTML() || form.content || '<p>Контент новости...</p>' }}
                  />
                </section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
