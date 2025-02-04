// คลาสสำหรับจัดการข้อมูลบล็อก
class Blog {
    constructor(id, title, content) {
        this.id = id;
        this.title = title;
        this.content = content;
        this.createdDate = new Date();
        this.updatedDate = new Date();
    }

    update(title, content) {
        this.title = title;
        this.content = content;
        this.updatedDate = new Date();
    }

    getFormattedDate() {
        return this.updatedDate.toLocaleString("th-TH", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
}

// คลาสสำหรับจัดการรายการบล็อก
class BlogManager {
    constructor() {
        this.blogs = JSON.parse(localStorage.getItem("blogs")) || [];
    }

    addBlog(title, content) {
        const blog = new Blog(Date.now(), title, content);
        this.blogs.push(blog);
        this.saveBlogs();
        return blog;
    }

    updateBlog(id, title, content) {
        const blog = this.getBlog(id);
        if (blog) {
            blog.update(title, content);
            this.saveBlogs();
        }
        return blog;
    }

    deleteBlog(id) {
        this.blogs = this.blogs.filter((blog) => blog.id !== id);
        this.saveBlogs();
    }

    getBlog(id) {
        return this.blogs.find((blog) => blog.id === id);
    }

    saveBlogs() {
        localStorage.setItem("blogs", JSON.stringify(this.blogs));
    }
}

// คลาสสำหรับจัดการ UI และ Event ต่างๆ
class BlogUI {
    constructor(blogManager) {
        this.blogManager = blogManager;
        this.initElements();
        this.initEventListeners();
        this.render();
    }

    initElements() {
        this.form = document.getElementById("blog-form");
        this.titleInput = document.getElementById("title");
        this.contentInput = document.getElementById("content");
        this.editIdInput = document.getElementById("edit-id");
        this.formTitle = document.getElementById("form-title");
        this.cancelBtn = document.getElementById("cancel-btn");
        this.blogList = document.getElementById("blog-list");
    }

    initEventListeners() {
        this.form.addEventListener("submit", (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        this.cancelBtn.addEventListener("click", () => {
            this.resetForm();
        });
    }

    handleSubmit() {
        const title = this.titleInput.value.trim();
        const content = this.contentInput.value.trim();
        const editId = parseInt(this.editIdInput.value);

        if (title && content) {
            if (editId) {
                this.blogManager.updateBlog(editId, title, content);
            } else {
                this.blogManager.addBlog(title, content);
            }
            this.resetForm();
            this.render();
        }
    }

    deleteBlog(id) {
        if (confirm("ต้องการลบบล็อกนี้หรือไม่?")) {
            this.blogManager.deleteBlog(id);
            this.render();
        }
    }

    resetForm() {
        this.form.reset();
        this.editIdInput.value = "";
        this.formTitle.textContent = "เขียนบล็อกใหม่";
        this.cancelBtn.classList.add("hidden");
    }

    render() {
        this.blogList.innerHTML = this.blogManager.blogs.map((blog) => `
            <div class="blog-post">
                <h2 class="blog-title">${blog.title}</h2>
                <div class="blog-date">อัปเดตเมื่อ: ${blog.getFormattedDate()}</div>
                <div class="blog-content">${blog.content.replace(/\n/g, "<br>")}</div>
                <div class="blog-actions">
                    <button class="btn-delete" onclick="blogUI.deleteBlog(${blog.id})">ลบ</button>
                </div>
            </div>
        `).join("");
    }
}

// เริ่มต้นใช้งาน
const blogManager = new BlogManager();
const blogUI = new BlogUI(blogManager);