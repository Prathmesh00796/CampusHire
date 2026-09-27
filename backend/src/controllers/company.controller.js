const { Company, Job } = require("../models");

/**
 * GET /api/companies
 * Return all companies.
 */
const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.findAll({ order: [["name", "ASC"]] });
    res.json({ success: true, data: companies });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * GET /api/companies/:id
 * Return a single company with its active jobs.
 */
const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id, {
      include: [{ model: Job, as: "jobs" }],
    });

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found." });
    }

    res.json({ success: true, data: company });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * POST /api/companies
 * Create a new company (Admin only).
 */
const createCompany = async (req, res) => {
  try {
    const { name, email, phone, industry, website, location, description, logo } = req.body;

    if (!name) {
      return res.status(400).json({ success: false, message: "Company name is required." });
    }

    const company = await Company.create({
      name, email, phone, industry, website, location, description, logo,
    });

    res.status(201).json({
      success: true,
      message: "Company created successfully.",
      data: company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * PUT /api/companies/:id
 * Update a company (Admin or that company's Recruiter).
 */
const updateCompany = async (req, res) => {
  try {
    const company = await Company.findByPk(req.params.id);

    if (!company) {
      return res.status(404).json({ success: false, message: "Company not found." });
    }

    const updatable = ["name", "email", "phone", "industry", "website", "location", "description", "logo"];
    updatable.forEach((field) => {
      if (req.body[field] !== undefined) company[field] = req.body[field];
    });

    await company.save();

    res.json({
      success: true,
      message: "Company updated successfully.",
      data: company,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAllCompanies, getCompanyById, createCompany, updateCompany };
