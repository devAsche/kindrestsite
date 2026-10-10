# Kindrest ページ・ポリシー英語案（確認用）

このファイルは確認用の下書きです。まだストアには反映していません。
OKをもらった後、Admin API で反映します（`pageUpdate` / `shopPolicyUpdate`）。
各案の英語がそのままストアに載る本文です。日本語は説明用です。

---

## 1. Contact Us（/pages/contact）

現在の問題：Pantrywise のメールアドレス（contact@pantrywisestore.com）が載っている。
このページの下にはテーマ側のお問い合わせフォームが表示されます。

```html
<p>Questions about your order or our products? We're happy to help.</p>
<p><strong>Email:</strong> <a href="mailto:contact@kindreststore.com">contact@kindreststore.com</a><br>
We usually reply within 1–2 business days.</p>
<p>If your message is about an order, please include your order number. If something arrived damaged or defective, a photo helps us sort it out quickly.</p>
<p>You can also send us a message with the form below.</p>
```

---

## 2. FAQ（/pages/faq）

現在の問題：包丁研ぎ器・パン袋のFAQになっている。
商品ページのFAQと同じ内容に、注文・返品の情報を足しています。実測値が必要な項目（冷凍時間・持続時間など）は入れていません。

```html
<h2>The Quiet Hours Cap</h2>
<h3>What is it?</h3>
<p>A soft gel cap that covers your head and eyes. Keep it in the freezer, then pull it on when you want a cool, dark, quiet break at the end of a long screen day.</p>
<h3>How do I use it?</h3>
<p>Keep it in the freezer. When you want a break, stretch it over your head and down over your eyes, then rest.</p>
<h3>Will it fit me?</h3>
<p>It's a one-size stretch fit designed to cover the head and eyes of most adults.</p>
<h3>What's in the 2-Pack?</h3>
<p>Two caps in the color you choose: one to wear while the other chills, or one for each of you.</p>

<h2>The Quiet Hours Neck Wrap</h2>
<h3>What is it?</h3>
<p>A soft gel wrap that rests on the back of your neck and shoulders. Keep it in the freezer next to your cap, so both are ready when you are.</p>
<h3>Is there a set offer?</h3>
<p>Yes. When you buy the Neck Wrap together with a Quiet Hours Cap, the Neck Wrap is 20% off. The discount is applied automatically in your cart.</p>

<h2>Orders &amp; shipping</h2>
<h3>Where do you ship?</h3>
<p>We currently ship to US addresses only. Shipping is free.</p>
<h3>How long does shipping take?</h3>
<p>Orders ship within 1–3 business days and usually arrive 5–11 business days after shipping, so most orders arrive 6–14 business days after you order. You'll get a tracking number by email. See our <a href="/policies/shipping-policy">Shipping Policy</a>.</p>
<h3>Can I cancel my order?</h3>
<p>Yes, free of charge, as long as it hasn't shipped yet. Email us with your order number as soon as possible.</p>

<h2>Returns</h2>
<h3>What if something's wrong with my order?</h3>
<p>If it arrives damaged, defective, or isn't what you ordered, email a photo to contact@kindreststore.com within 30 days of delivery. We'll send a replacement or a full refund, and you don't need to send anything back.</p>
<h3>Can I return it if I change my mind?</h3>
<p>We're sorry, but we can't accept returns for a change of mind. Please read the product details before you order, and feel free to email us with any questions first. See our <a href="/policies/refund-policy">Refund Policy</a>.</p>

<h2>Good to know</h2>
<h3>Who is it for?</h3>
<p>Anyone who wants a cool, quiet break after a long day of screens. Our products are comfort items made for resting. They are not medical devices. If you have a health concern, please talk to your doctor.</p>
<h3>How do I contact you?</h3>
<p>Email <a href="mailto:contact@kindreststore.com">contact@kindreststore.com</a> or use our <a href="/pages/contact">Contact page</a>. We usually reply within 1–2 business days.</p>
```

---

## 3. Our Story（/pages/about）

現在の問題：Pantrywise の創業ストーリーになっている。
作り話（創業エピソードなど）は入れず、事実だけで書いています。個人事業（屋号 Kindrest）であることを「small, independent shop」と表現しています。

```html
<p class="hh-lede">Kindrest started with a simple idea: the end of a long screen day deserves a proper pause.</p>
<p>So much of the day happens on a screen. We wanted something low-tech for the moment you close the laptop: something cool, soft, and dark that helps you step away for a while.</p>
<h2>What we make</h2>
<p>Our Quiet Hours collection is small on purpose. The <a href="/products/kindrest-quiet-hours-cap">Quiet Hours Cap</a> is a soft gel cap that covers your head and eyes. The <a href="/products/kindrest-quiet-hours-neck-wrap">Quiet Hours Neck Wrap</a> rests on your neck and shoulders. Both live in the freezer, so they're ready when you are.</p>
<h2>How we work</h2>
<ul>
<li>Kindrest is a small, independent shop.</li>
<li>Free shipping on every US order.</li>
<li>If your order arrives damaged, defective, or isn't what you ordered, we'll replace it or refund you. No need to send anything back.</li>
<li>Real answers from a real person, usually within 1–2 business days.</li>
</ul>
<p>Our products are comfort items, not medical devices.</p>
<p>Questions or ideas? <a href="/pages/contact">We'd love to hear from you</a>.</p>
```

---

## 4. Legal Notice（特定商取引法に基づく表記 → 英語版）

現在の日本語の内容をそのまま英訳しています（内容は変えていません）。
⚠️ **お名前のローマ字表記を確認させてください**（下の案では仮に「Ryo Ozeki」としています）。

```html
<p><strong>Seller:</strong> Ryo Ozeki (trading as Kindrest)</p>
<p><strong>Person responsible:</strong> Ryo Ozeki</p>
<p><strong>Address:</strong> Provided by email without delay upon request.</p>
<p><strong>Phone:</strong> Provided by email without delay upon request. Please contact us by email.</p>
<p><strong>Email:</strong> contact@kindreststore.com</p>
<p><strong>Prices:</strong> Shown on each product page in US dollars (USD).</p>
<p><strong>Shipping:</strong> Free (we ship within the United States only).</p>
<p><strong>Other charges:</strong> None.</p>
<p><strong>Payment methods:</strong> Credit and debit cards, Shop Pay, Google Pay, and others (the options shown depend on your device).</p>
<p><strong>Payment timing:</strong> Charged when your order is placed.</p>
<p><strong>Delivery:</strong> Usually 6–14 business days after your order (1–3 business days to prepare + 5–11 business days in transit).</p>
<p><strong>Returns and exchanges:</strong> We do not accept returns or exchanges for a change of mind. If your item arrives damaged, defective, or incorrect, email us within 30 days of delivery with your order number and a photo showing the issue. After review, we will send a replacement or issue a full refund at our cost. You do not need to return the item.</p>
<p><strong>Cancellations:</strong> Free of charge before your order ships. Please email us as soon as possible.</p>
<p><strong>About our products:</strong> Our products are general comfort and relaxation items, not medical devices. They are not intended to diagnose, treat, or prevent any disease.</p>
```

※ページのタイトル（「特定商取引法に基づく表記」）は Shopify 側で決まるもので、API では本文しか変えられません。タイトルを英語にするには、管理画面の言語設定を確認する必要があります（後で手順をお伝えします）。

---

## 5. Terms of Service（利用規約）

変更点は2か所だけです。それ以外は現在の文章のままです。

- 「Wellness Products」の段落：FDA に触れた1文を削除します。
  - 削除する文：`Statements on this website have not been evaluated by the U.S. Food and Drug Administration.`
- 「Safe Use」の段落：「hot or cold therapy items」→「cooling items」に変えます（温めて使えるという印象を避けるため）。

変更後の2段落：

```html
<p>Wellness Products<br>Our products are general comfort and relaxation items. They are not medical devices and are not intended to diagnose, treat, cure, or prevent any disease or medical condition. If you have a medical condition, frequent or severe pain, or any health concern, please consult a qualified healthcare professional.</p>
<p>Safe Use<br>Please follow the instructions included with each product. For cooling items, limit each use to about 15–20 minutes, check your skin regularly, and stop use if you feel discomfort, numbness, or skin irritation. Do not use on broken or sensitive skin, and keep products away from young children unless used under adult supervision. Use each product only for its intended purpose.</p>
```
