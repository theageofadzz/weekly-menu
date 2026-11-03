(function (root) {
  "use strict";
  const DAY = 86400000;
  const STORAGE_KEY = "weekly-menu-food-journal-v1";
  const storageNames = {
    unknown: "保存待确认",
    fridge: "冷藏",
    freezer: "冷冻",
    room: "常温",
  };
  const categoryIcons = {
    prepared: "sandwich",
    meat: "beef",
    vegetable: "carrot",
    dairy: "milk",
    dessert: "cake-slice",
    staple: "wheat",
    other: "package",
  };
  const statusNames = { active: "在库", eaten: "已吃完", discarded: "已丢弃" };
  const PURCHASE_BATCH_ID = "purchase-screenshot-20261103";
  const PRODUCT_DETAILS_REVISION = "product-screenshots-20261026";
  const productShelfLives = {
    顺德鱼皮角: "12个月",
    玉米猪肉蒸饺: "12个月",
    鲜虾荠菜猪肉水饺: "12个月",
    亚麻籽冷鲜猪肉丸子: "5天",
    去皮五花肉片: "4天",
    冷鲜猪瘦肉丝: "4天",
  };
  const seedData = [
    ["顺德鱼皮角", "180g × 1", 14.32, "prepared", ""],
    ["玉米猪肉蒸饺", "264g，12只 × 1", 7.12, "prepared", ""],
    ["鲜虾荠菜猪肉水饺", "240g，12只 × 1", 10.72, "prepared", ""],
    [
      "亚麻籽冷鲜猪肉丸子",
      "250g · 数量待确认",
      12.52,
      "meat",
      "购买数量待确认。",
    ],
    ["去皮五花肉片", "约250g / 盒 × 1", 25.67, "meat", ""],
    [
      "冷鲜猪瘦肉丝",
      "约200g / 盒 × 2",
      10.8,
      "meat",
      "两盒合计实付10.80元，未重复乘数量。",
    ],
    ["菜心苗", "250g × 1", 5.34, "vegetable", ""],
    ["豇豆", "300g × 1", 5.4, "vegetable", ""],
    ["鸡蛋火腿松松三明治", "160g，4块装 × 1", 8.92, "prepared", ""],
    ["田园时蔬三明治", "190g × 1", 8.02, "prepared", ""],
    ["迪拜巧克力风味开心果千层蛋糕", "300g × 1", 26.93, "dessert", ""],
  ];
  function localDate(date = new Date()) {
    return [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");
  }
  // Calendar-day arithmetic avoids daylight saving and time-of-day rounding errors.
  function dayNumber(value) {
    if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
      return null;
    const [year, month, day] = value.split("-").map(Number);
    if (year < 1900 || year > 2200) return null;
    const date = new Date(Date.UTC(year, month - 1, day));
    if (
      date.getUTCFullYear() !== year ||
      date.getUTCMonth() + 1 !== month ||
      date.getUTCDate() !== day
    )
      return null;
    return date.getTime() / DAY;
  }
  function deadline(item) {
    return (
      [item.expiryDate, item.useByDate]
        .filter((value) => dayNumber(value) !== null)
        .sort()[0] || ""
    );
  }
  function deadlineInfo(item, today = localDate()) {
    const date = deadline(item);
    const basis =
      date && date === item.useByDate
        ? item.dateBasis === "personal"
          ? "个人计划截止"
          : "开封后 / 保存截止"
        : "包装到期";
    if (!date)
      return { date: "", days: null, status: "missing", basis: "日期待补全" };
    const todayNumber = dayNumber(today);
    if (todayNumber === null) throw new Error("当前日期无效");
    const days = dayNumber(date) - todayNumber;
    return {
      date,
      days,
      status:
        days < 0
          ? "expired"
          : days === 0
            ? "today"
            : days <= 3
              ? "soon"
              : "fresh",
      basis,
    };
  }
  function seedItems() {
    const original = seedData.map(
      ([name, quantity, price, category, notes], index) => ({
        id: `initial-purchase-20261025-${index + 1}`,
        name,
        quantity,
        price,
        category,
        notes,
        remaining: "",
        storage: "unknown",
        purchaseDate: "",
        productionDate: "",
        expiryDate: "",
        openedDate: "",
        useByDate: "",
        shelfLife: productShelfLives[name] || "",
        productDetailsRevision: productShelfLives[name]
          ? PRODUCT_DETAILS_REVISION
          : "",
        dateBasis: "label",
        shop: "",
        status: "active",
        finishedDate: "",
        createdAt: "2026-10-25T00:00:00+08:00",
        updatedAt: "2026-10-25T00:00:00+08:00",
        source: "2026年10月25日提交的采购截图；购买日期待确认",
      }),
    );
    return [...original, ...purchaseItems()];
  }
  function purchaseItems() {
    const purchases = [
      {
        name: "慢养黑猪冷鲜瘦肉丝",
        quantity: "约150g / 盒 × 3，合计约450g",
        price: 24.27,
        category: "meat",
        productionDate: "2026-10-30",
        notes:
          "单价8.09元 / 盒，3盒合计实付24.27元；与原有约200g装瘦肉丝分批记录。",
      },
      {
        name: "象大厨内酯豆腐",
        quantity: "400g / 盒 × 3，合计1200g",
        price: 5.4,
        category: "other",
        productionDate: "2026-10-30",
        notes: "单价1.80元 / 盒，3盒合计实付5.40元。",
      },
      {
        name: "鲜切冬瓜",
        quantity: "约800g / 份 × 1",
        price: 2.88,
        category: "vegetable",
        productionDate: "",
        notes: "单价2.88元 / 份，实付2.88元。",
      },
      {
        name: "安心蛋保洁鲜鸡蛋",
        quantity: "30枚 / 盒，1.59kg / 盒 · 盒数待确认",
        price: 21.8,
        category: "dairy",
        productionDate: "",
        notes: "截图可见单价及实付均为21.80元；购买盒数被截住，未推断总枚数。",
      },
    ];
    return purchases.map((purchase, index) =>
      validateItem({
        id: `${PURCHASE_BATCH_ID}-${index + 1}`,
        remaining: "",
        storage: "unknown",
        purchaseDate: "",
        expiryDate: "",
        openedDate: "",
        useByDate: "",
        shelfLife: "",
        productDetailsRevision: "",
        dateBasis: "label",
        shop: "",
        status: "active",
        finishedDate: "",
        createdAt: "2026-11-03T00:00:00+08:00",
        updatedAt: "2026-11-03T00:00:00+08:00",
        source:
          "2026年11月3日提交的已送达订单截图；购买日期、保存方式和保质期待确认",
        ...purchase,
      }),
    );
  }
  function applyPurchaseUpdates(data) {
    const batches = data.appliedPurchaseBatches || [];
    if (batches.includes(PURCHASE_BATCH_ID)) return data;
    const existingIds = new Set(data.items.map((item) => item.id));
    const additions = purchaseItems().filter(
      (item) => !existingIds.has(item.id),
    );
    if (data.items.length + additions.length > 5000) return data;
    // Remember the batch so edited, archived or deleted purchases stay that way.
    return {
      ...data,
      items: [...data.items, ...additions],
      appliedPurchaseBatches: [...batches, PURCHASE_BATCH_ID],
    };
  }
  function validateItem(item) {
    if (!item || typeof item !== "object" || Array.isArray(item))
      throw new Error("食材记录格式不正确");
    const fields = [
      "id",
      "name",
      "quantity",
      "remaining",
      "storage",
      "category",
      "purchaseDate",
      "productionDate",
      "expiryDate",
      "openedDate",
      "useByDate",
      "shelfLife",
      "productDetailsRevision",
      "dateBasis",
      "shop",
      "notes",
      "status",
      "finishedDate",
      "createdAt",
      "updatedAt",
      "source",
    ];
    const copy = {};
    for (const key of fields) {
      if (item[key] !== undefined && typeof item[key] !== "string")
        throw new Error("记录中有无效的文字字段");
      copy[key] = (item[key] || "").trim();
      const limit =
        key === "notes"
          ? 2000
          : key === "quantity"
            ? 160
            : key === "shop" || key === "source"
              ? 200
              : 120;
      if (copy[key].length > limit) throw new Error("记录中的文字过长");
    }
    if (!copy.id || !copy.name) throw new Error("食材名称不能为空");
    if (
      !Object.hasOwn(storageNames, copy.storage) ||
      !Object.hasOwn(categoryIcons, copy.category) ||
      !Object.hasOwn(statusNames, copy.status)
    )
      throw new Error("记录中的分类、状态或保存方式无效");
    if (!["label", "personal"].includes(copy.dateBasis))
      throw new Error("日期依据无效");
    if (
      item.price !== null &&
      (typeof item.price !== "number" ||
        !Number.isFinite(item.price) ||
        item.price < 0 ||
        item.price > 999999.99)
    )
      throw new Error("实付金额应为0至999999.99元，或留空");
    copy.price =
      item.price === null ? null : Math.round(item.price * 100) / 100;
    for (const key of [
      "purchaseDate",
      "productionDate",
      "expiryDate",
      "openedDate",
      "useByDate",
      "finishedDate",
    ]) {
      if (copy[key] && dayNumber(copy[key]) === null)
        throw new Error("请填写有效的日期（1900年至2200年）");
    }
    if (
      copy.productionDate &&
      [
        copy.purchaseDate,
        copy.expiryDate,
        copy.openedDate,
        copy.useByDate,
      ].some((date) => date && date < copy.productionDate)
    )
      throw new Error("购买、开封或截止日期不能早于生产日期");
    if (
      copy.purchaseDate &&
      copy.expiryDate &&
      copy.expiryDate < copy.purchaseDate
    )
      throw new Error("包装到期日不能早于购买日期");
    if (
      copy.purchaseDate &&
      copy.openedDate &&
      copy.openedDate < copy.purchaseDate
    )
      throw new Error("开封日期不能早于购买日期");
    if (
      copy.useByDate &&
      copy.useByDate < (copy.openedDate || copy.purchaseDate)
    )
      throw new Error("自定截止日不能早于购买或开封日期");
    for (const key of ["createdAt", "updatedAt"]) {
      if (!copy[key] || Number.isNaN(Date.parse(copy[key])))
        throw new Error("记录的更新时间无效");
    }
    if (copy.status !== "active" && !copy.finishedDate)
      throw new Error("已处理的食材缺少处理日期");
    return copy;
  }
  function parseBackup(value) {
    const data = typeof value === "string" ? JSON.parse(value) : value;
    if (
      !data ||
      data.version !== 1 ||
      !Array.isArray(data.items) ||
      data.items.length > 5000
    )
      throw new Error("请选择有效的食材记录备份（最多5000项）");
    const items = data.items.map(validateItem);
    if (new Set(items.map((item) => item.id)).size !== items.length)
      throw new Error("备份中有重复编号，请先检查备份");
    const result = { version: 1, items: completeProductDetails(items) };
    if (data.appliedPurchaseBatches !== undefined) {
      if (
        !Array.isArray(data.appliedPurchaseBatches) ||
        data.appliedPurchaseBatches.length > 1000 ||
        data.appliedPurchaseBatches.some(
          (batch) => typeof batch !== "string" || !batch || batch.length > 120,
        ) ||
        new Set(data.appliedPurchaseBatches).size !==
          data.appliedPurchaseBatches.length
      )
        throw new Error("备份中的采购批次记录无效");
      result.appliedPurchaseBatches = [...data.appliedPurchaseBatches];
    }
    return result;
  }
  function completeProductDetails(items) {
    return items.map((item) => {
      const index = seedData.findIndex(([name]) => name === item.name);
      if (
        index < 0 ||
        item.id !== `initial-purchase-20261025-${index + 1}` ||
        !Object.hasOwn(productShelfLives, item.name) ||
        item.productDetailsRevision === PRODUCT_DETAILS_REVISION
      )
        return item;
      // Enrich only the original purchase, once, without replacing user details.
      return {
        ...item,
        shelfLife: item.shelfLife || productShelfLives[item.name],
        productDetailsRevision: PRODUCT_DETAILS_REVISION,
      };
    });
  }
  function mergeItems(current, incoming) {
    const merged = new Map(current.map((item) => [item.id, item]));
    for (const item of incoming) {
      const existing = merged.get(item.id);
      if (
        !existing ||
        Date.parse(item.updatedAt) > Date.parse(existing.updatedAt)
      )
        merged.set(item.id, item);
    }
    if (merged.size > 5000) throw new Error("合并后超过5000项，请先整理记录");
    return completeProductDetails([...merged.values()]);
  }
  function summarize(items, today = localDate()) {
    const active = items.filter((item) => item.status === "active");
    return {
      total: active.length,
      soon: active.filter((item) => {
        const days = deadlineInfo(item, today).days;
        return days !== null && days >= 0 && days <= 3;
      }).length,
      expired: active.filter(
        (item) => deadlineInfo(item, today).status === "expired",
      ).length,
      missing: active.filter(
        (item) => deadlineInfo(item, today).status === "missing",
      ).length,
      spent:
        items.reduce(
          (sum, item) =>
            sum + (item.price === null ? 0 : Math.round(item.price * 100)),
          0,
        ) / 100,
      unknownPrices: items.filter((item) => item.price === null).length,
    };
  }
  const api = {
    STORAGE_KEY,
    PURCHASE_BATCH_ID,
    storageNames,
    categoryIcons,
    statusNames,
    localDate,
    dayNumber,
    deadline,
    deadlineInfo,
    seedItems,
    purchaseItems,
    applyPurchaseUpdates,
    validateItem,
    parseBackup,
    mergeItems,
    summarize,
  };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.Pantry = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
