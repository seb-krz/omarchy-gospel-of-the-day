const assert = require("assert")
const Model = require("../Model.js")

assert.strictEqual(Model.normalizeLanguage(""), "")
assert.strictEqual(Model.normalizeLanguage(null), "")
assert.strictEqual(Model.normalizeLanguage("sp"), "SP")
assert.strictEqual(Model.normalizeLanguage(" AM "), "AM")
assert.strictEqual(Model.normalizeLanguage("xx"), "")
assert.strictEqual(Model.normalizeLanguage("TRA"), "")
assert.strictEqual(Model.languageLabel("AR"), "العربية")
assert.strictEqual(Model.isRtlLanguage("AR"), true)
assert.strictEqual(Model.isRtlLanguage("ar"), true)
assert.strictEqual(Model.isRtlLanguage("SP"), false)
assert.strictEqual(Model.isRtlLanguage("GR"), false)
assert.strictEqual(Model.languageEntry("AR").rtl, true)
assert.deepStrictEqual(Model.languageList().map((item) => item.code), [
  "SP", "AM", "FR", "IT", "DE", "PT", "AR", "PL", "NL", "GR", "MG"
])
assert.strictEqual(Model.languageList().length, 11)
assert.strictEqual(Model.languageIndex("DE"), 4)
assert.strictEqual(Model.languageIndex(""), 0)

const parsed = Model.parsePayload(JSON.stringify({
  date: "2026-08-15",
  language: "sp",
  liturgicalTitle: "Prueba",
  readings: [{ kind: "first", title: "T", reference: "R", text: "Texto" }, { kind: "second", title: "", reference: "", text: "" }],
  gospel: { kind: "gospel", title: "G", reference: "Ev", text: "Evangelio" },
  commentary: { available: true, title: "C", author: "A", source: "S", text: "Nota" },
  provider: "evangelizo.org",
  fetchedAt: "2026-08-15T00:00:00+00:00"
}))
assert.strictEqual(parsed.language, "SP")
assert.strictEqual(parsed.readings.length, 1)
assert.strictEqual(parsed.gospel.text, "Evangelio")
assert.strictEqual(parsed.commentary.author, "A")
assert.strictEqual(Model.parsePayload(""), null)
assert.strictEqual(Model.parsePayload("{"), null)
assert.strictEqual(Model.tabId(1), "gospel")

const today = new Date(2026, 7, 15)
assert.strictEqual(Model.isoDate(today), "2026-08-15")
assert.strictEqual(Model.isoDate(Model.addDays(today, -1)), "2026-08-14")
assert.strictEqual(Model.canStepDate(today, today, 1), false)
assert.strictEqual(Model.canStepDate(today, today, -1), true)
assert.strictEqual(Model.isoDate(Model.clampViewDate(Model.addDays(today, -40), today)), "2026-07-16")
assert.strictEqual(Model.isSameDay(today, new Date(2026, 7, 15)), true)

console.log("model-test: ok")
