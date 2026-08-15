var LANGUAGES = [
  { code: "SP", name: "Español", rtl: false },
  { code: "AM", name: "English (US)", rtl: false },
  { code: "FR", name: "Français", rtl: false },
  { code: "IT", name: "Italiano", rtl: false },
  { code: "DE", name: "Deutsch", rtl: false },
  { code: "PT", name: "Português", rtl: false },
  { code: "AR", name: "العربية", rtl: true },
  { code: "PL", name: "Polski", rtl: false },
  { code: "NL", name: "Nederlands", rtl: false },
  { code: "GR", name: "Ελληνικά", rtl: false },
  { code: "MG", name: "Malagasy", rtl: false }
]

function languageList() {
  return LANGUAGES.slice()
}

function normalizeLanguage(value) {
  var text = String(value === undefined || value === null ? "" : value).replace(/^\s+|\s+$/g, "").toUpperCase()
  if (text === "") return ""
  for (var i = 0; i < LANGUAGES.length; i++)
    if (LANGUAGES[i].code === text) return LANGUAGES[i].code
  return ""
}

function languageEntry(value) {
  var code = normalizeLanguage(value)
  if (code === "") return null
  for (var i = 0; i < LANGUAGES.length; i++)
    if (LANGUAGES[i].code === code) return LANGUAGES[i]
  return null
}

function languageLabel(value) {
  var entry = languageEntry(value)
  return entry ? entry.name : ""
}

function isRtlLanguage(value) {
  var entry = languageEntry(value)
  return !!(entry && entry.rtl)
}

function languageIndex(value) {
  var code = normalizeLanguage(value)
  if (code === "") return 0
  for (var i = 0; i < LANGUAGES.length; i++)
    if (LANGUAGES[i].code === code) return i
  return 0
}

var TABS = ["readings", "gospel", "commentary"]
var MAX_LOOKBACK_DAYS = 30

function pad2(value) {
  var n = Number(value)
  return (n < 10 ? "0" : "") + n
}

function isoDate(date) {
  if (!date || typeof date.getFullYear !== "function") return ""
  return date.getFullYear() + "-" + pad2(date.getMonth() + 1) + "-" + pad2(date.getDate())
}

function startOfDay(date) {
  if (!date || typeof date.getFullYear !== "function") return new Date()
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date, delta) {
  var next = startOfDay(date)
  next.setDate(next.getDate() + Number(delta || 0))
  return next
}

function clampViewDate(date, today) {
  var now = startOfDay(today || new Date())
  var day = startOfDay(date || now)
  var earliest = addDays(now, -MAX_LOOKBACK_DAYS)
  if (day.getTime() > now.getTime()) return now
  if (day.getTime() < earliest.getTime()) return earliest
  return day
}

function isSameDay(a, b) {
  return isoDate(a) !== "" && isoDate(a) === isoDate(b)
}

function canStepDate(date, today, delta) {
  var current = clampViewDate(date, today)
  var stepped = addDays(current, delta)
  var clamped = clampViewDate(stepped, today)
  return isoDate(clamped) === isoDate(stepped)
}

function emptyReading(kind) {
  return { kind: kind || "", title: "", reference: "", text: "" }
}

function emptyCommentary() {
  return { available: false, title: "", author: "", source: "", text: "" }
}

function emptyDay() {
  return {
    date: "",
    language: "",
    liturgicalTitle: "",
    readings: [],
    gospel: emptyReading("gospel"),
    commentary: emptyCommentary(),
    provider: "",
    fetchedAt: ""
  }
}

function asText(value) {
  return String(value === undefined || value === null ? "" : value)
}

function normalizeReading(raw, fallbackKind) {
  var item = raw && typeof raw === "object" ? raw : {}
  return {
    kind: asText(item.kind || fallbackKind),
    title: asText(item.title),
    reference: asText(item.reference),
    text: asText(item.text)
  }
}

function normalizeCommentary(raw) {
  var item = raw && typeof raw === "object" ? raw : {}
  var text = asText(item.text)
  return {
    available: item.available === true || text !== "",
    title: asText(item.title),
    author: asText(item.author),
    source: asText(item.source),
    text: text
  }
}

function parsePayload(raw) {
  var data = raw
  if (typeof raw === "string") {
    var text = raw.replace(/^\s+|\s+$/g, "")
    if (text === "") return null
    try {
      data = JSON.parse(text)
    } catch (e) {
      return null
    }
  }
  if (!data || typeof data !== "object") return null
  var readings = []
  var sourceReadings = data.readings
  if (sourceReadings && typeof sourceReadings.length === "number") {
    for (var i = 0; i < sourceReadings.length; i++) {
      var reading = normalizeReading(sourceReadings[i], "")
      if (reading.text !== "") readings.push(reading)
    }
  }
  return {
    date: asText(data.date),
    language: normalizeLanguage(data.language),
    liturgicalTitle: asText(data.liturgicalTitle),
    readings: readings,
    gospel: normalizeReading(data.gospel, "gospel"),
    commentary: normalizeCommentary(data.commentary),
    provider: asText(data.provider) || "evangelizo.org",
    fetchedAt: asText(data.fetchedAt)
  }
}

function tabId(index) {
  var n = Number(index)
  if (!isFinite(n) || n < 0 || n > 2) return TABS[0]
  return TABS[n]
}

function commentaryByline(commentary) {
  var item = commentary && typeof commentary === "object" ? commentary : {}
  var author = asText(item.author)
  var source = asText(item.source)
  if (author !== "" && source !== "") return author + " · " + source
  return author || source
}

if (typeof module !== "undefined") {
  module.exports = {
    LANGUAGES: LANGUAGES,
    TABS: TABS,
    languageList: languageList,
    normalizeLanguage: normalizeLanguage,
    languageEntry: languageEntry,
    languageLabel: languageLabel,
    isRtlLanguage: isRtlLanguage,
    languageIndex: languageIndex,
    emptyDay: emptyDay,
    parsePayload: parsePayload,
    tabId: tabId,
    commentaryByline: commentaryByline,
    MAX_LOOKBACK_DAYS: MAX_LOOKBACK_DAYS,
    isoDate: isoDate,
    addDays: addDays,
    clampViewDate: clampViewDate,
    isSameDay: isSameDay,
    canStepDate: canStepDate
  }
}
