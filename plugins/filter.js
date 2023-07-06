export default async (_, inject) => {
  function init(data, filters, blocked = []) {
    let results = data;

    filters.forEach((search) => {
      results = results.filter((item) => {
        if (
          Object.keys(item).filter((key) => {
            if (!blocked.find((i) => i == key)) {
              const value = item[key];

              if (value.toString().indexOf(search.value) > -1) {
                return value;
              }
            }
          }).length
        )
          return item;
      });
    });

    return results;
  }
  inject("filter", init);
};
