const User = require('../models/User');
const Shop = require('../models/Shop');

const userAttributes = {
  exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'],
};

const shopInclude = { model: Shop, attributes: ['id', 'name'] };

function getManagedRole(callerRole) {
  if (callerRole === 'super-admin') return 'admin';
  if (callerRole === 'admin') return 'employee';
  return null;
}

function canManageUser(caller, target) {
  const managedRole = getManagedRole(caller.role);
  if (!managedRole) return false;
  if (!target) return false;
  if (target.role === 'super-admin') return false;
  return target.role === managedRole;
}

async function findManagedUser(id, caller) {
  const target = await User.findByPk(id, {
    attributes: userAttributes,
    include: [shopInclude],
  });
  if (!canManageUser(caller, target)) return null;
  return target;
}

// @desc    Get users (super-admin: admins, admin: employees)
// @route   GET /api/users
// @access  Private (super-admin, admin)
const getUsers = async (req, res) => {
  try {
    const roleFilter = getManagedRole(req.user.role);
    if (!roleFilter) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const users = await User.findAll({
      where: { role: roleFilter },
      attributes: userAttributes,
      include: [shopInclude],
      order: [['createdAt', 'DESC']],
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user (super-admin: admin, admin: employee)
// @route   PUT /api/users/:id
// @access  Private (super-admin, admin)
const updateUser = async (req, res) => {
  const { name, username, email, password, shopId } = req.body;

  try {
    const target = await User.findByPk(req.params.id);
    if (!canManageUser(req.user, target)) {
      return res.status(403).json({ message: 'Not authorized to update this user' });
    }

    if (username && username !== target.username) {
      const exists = await User.findOne({ where: { username } });
      if (exists) {
        return res.status(400).json({ message: 'Username already exists' });
      }
      target.username = username;
    }

    if (email && email !== target.email) {
      const exists = await User.findOne({ where: { email } });
      if (exists) {
        return res.status(400).json({ message: 'Email already exists' });
      }
      target.email = email;
    }

    if (name) target.name = name;

    if (password) {
      target.password = password;
    }

    if (target.role === 'employee') {
      if (!shopId) {
        return res.status(400).json({ message: 'Shop is required for employee' });
      }
      const shopExists = await Shop.findByPk(shopId);
      if (!shopExists) {
        return res.status(400).json({ message: 'Invalid shop selected' });
      }
      target.shopId = shopId;
    }

    await target.save();

    const updated = await User.findByPk(target.id, {
      attributes: userAttributes,
      include: [shopInclude],
    });

    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (super-admin: admin, admin: employee)
// @route   DELETE /api/users/:id
// @access  Private (super-admin, admin)
const deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own account' });
    }

    const target = await User.findByPk(req.params.id);
    if (!canManageUser(req.user, target)) {
      return res.status(403).json({ message: 'Not authorized to delete this user' });
    }

    await target.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getUsers,
  updateUser,
  deleteUser,
  findManagedUser,
};
