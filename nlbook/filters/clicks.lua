function Link(el)
  local target = el.target or ""

  if target:match("^panel:") then
    local id = target:gsub("^panel:", "")
    return pandoc.Span(el.content, { class = "selectable", ["data-panel"] = id })
  end

  if target:match("^anim:") then
    local id = target:gsub("^anim:", "")
    return pandoc.RawInline("html", '<div class="animMount" data-anim="' .. id .. '"></div>')
  end

  return nil
end
