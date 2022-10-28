const AppError = require("../../utils/errors/AppError");
const Role = require("../../models/role.model");

exports.removeUnnecessaryFields = (obj, key, allowedFields) => {
  if (!obj) return {};

  if (!key || !allowedFields || !allowedFields.length) return obj;

  if (obj instanceof Array)
    for (let data of obj)
      this.removeUnnecessaryFields(data, key, allowedFields);

  if (!obj[key]) return obj;
  else {
    if (obj[key] instanceof Array) {
      for (let _data of obj[key]) {
        for (let key in _data)
          if (!allowedFields.includes(key)) delete _data[key];

        if (_data[key]) this.removeUnnecessaryFields(_data, key, allowedFields);
      }
    } else {
      for (let _key in obj[key])
        if (!allowedFields.includes(_key)) delete obj[key][_key];

      if (obj[key]) this.removeUnnecessaryFields(obj[key], key, allowedFields);
    }
  }

  return obj;
};

exports.checkExistingRole = async (filteredBody, req, id) => {
  if (filteredBody.name) {
    let deleteQuery = {
      name: filteredBody.name,
      status: "Deleted",
      _tenantId: req.user._tenantId,
    };
    await Role.findOneAndDelete(deleteQuery);

    let findQuery = {
      name: filteredBody.name,
      status: { $ne: "Deleted" },
      _tenantId: req.user._tenantId,
    };

    const foundRole = await Role.findOne(findQuery);

    if (foundRole) return new AppError("Name already used.", 400);
  } else if (filteredBody.name) {
    let deleteQuery = {
      name: filteredBody.name,
      status: "Deleted",
      _tenantId: req.user._tenantId,
    };
    await Role.findOneAndDelete(deleteQuery);

    let findQuery = {
      name: filteredBody.name,
      status: { $ne: "Deleted" },
      _tenantId: req.user._tenantId,
    };

    const foundRole = await Role.findOne(findQuery);
    if (foundRole) return new AppError("Name already used.", 400);
  }

  return null;
};

exports.subAccessFields = [
  "label",
  "hasAccess",
  "route",
  "metadata",
  "subaccess",
  "action",
  "subNodes",
  "header",
];
