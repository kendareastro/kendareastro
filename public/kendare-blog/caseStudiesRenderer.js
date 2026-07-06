(function () {
  const mount = document.getElementById("case-study-sections");
  const searchForm = document.querySelector(".case-search");
  const searchInput = document.getElementById("case-study-search");
  const studies = Array.isArray(window.caseStudies) ? window.caseStudies : [];

  if (!mount) {
    return;
  }

  const normalize = (value) => String(value || "").trim().toLowerCase();

  function groupByCategory(items) {
    return items.reduce((groups, study) => {
      const category = study.category || "Uncategorized";
      if (!groups.has(category)) {
        groups.set(category, []);
      }
      groups.get(category).push(study);
      return groups;
    }, new Map());
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text) {
      element.textContent = text;
    }
    return element;
  }

  function createCard(study) {
    const card = createElement("article", "case-card");

    const link = createElement("a", "case-card__media");
    link.href = study.caseStudyLink;
    link.setAttribute("aria-label", study.title);

    const image = document.createElement("img");
    image.src = study.imageUrl;
    image.alt = study.title;
    link.appendChild(image);

    const body = createElement("div", "case-card__body");
    const title = createElement("h3", "case-card__title");
    const titleLink = document.createElement("a");
    titleLink.href = study.caseStudyLink;
    titleLink.textContent = study.title;
    title.appendChild(titleLink);

    const description = createElement("p", "case-card__description", study.description);
    const cta = createElement("a", "case-card__link", "Read case study");
    cta.href = study.caseStudyLink;

    body.append(title, description, cta);
    card.append(link, body);

    return card;
  }

  function createSection(category, items) {
    const section = createElement("section", "case-category");
    const heading = createElement("h2", "case-category__title", category);
    const grid = createElement("div", "case-grid");

    items.forEach((study) => grid.appendChild(createCard(study)));
    section.append(heading, grid);

    return section;
  }

  function render(query = "") {
    const searchTerm = normalize(query);
    const filteredStudies = studies.filter((study) => {
      if (!searchTerm) {
        return true;
      }

      return [study.category, study.title, study.description]
        .map(normalize)
        .some((value) => value.includes(searchTerm));
    });

    mount.textContent = "";

    if (!filteredStudies.length) {
      mount.appendChild(createElement("p", "case-empty", "No case studies found."));
      return;
    }

    groupByCategory(filteredStudies).forEach((items, category) => {
      mount.appendChild(createSection(category, items));
    });
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener("submit", (event) => {
      event.preventDefault();
      render(searchInput.value);
    });

    searchInput.addEventListener("input", () => render(searchInput.value));
  }

  render();
})();
