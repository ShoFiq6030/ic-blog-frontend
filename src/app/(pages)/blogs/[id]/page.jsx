"use client";
import BlogEditModal from "@/components/admin/BlogEditModal";
import ConfirmModal from "@/components/CofirmModal";
import CommentBox from "@/components/CommentBox";
import RelatedBlogs from "@/components/RelatedBlogs";
import { useGetBlogQuery, useGetUserQuery } from "@/features/api/apiSlice";
import { useUserDetails } from "@/features/hooks/useUser";
import { publishDate } from "@/utils/PublishDate";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useState } from "react";

import { FaEllipsisV, FaRegCommentAlt } from "react-icons/fa";
import { IoIosTimer } from "react-icons/io";
import { useEffect, useRef } from "react";
import LikeCommentButton from "@/components/LikeCommentButton";

const BlogDetails = () => {
  const [like, setLike] = useState(false);
  const [commentBox, setCommentBox] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [yes, setYes] = useState(false);
  const { id } = useParams();
  const { data: singleBlog, refetch } = useGetBlogQuery(id);
  const { data: author } = useGetUserQuery(singleBlog?.data?.author);
  const blog = singleBlog?.data;
  const publishedAgo = publishDate(blog?.createdAt);
  const { userDetails } = useUserDetails();
  const commentInputRef = useRef();
  // console.log(author, blog);
  const dropdownRef = useRef();
  // close dropdown if user click out side
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setModelOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDelete = async (blog) => {
    try {
      await deleteBlog(blog._id);
      toast.success(`"${blog?.title}" is deleted`);
    } catch (err) {
      toast.error(err?.message || "Couldn't delete");
    }
  };

  const handleEdit = () => {
    setEditModal(!editModal);
  };
  const onClose = () => {
    setEditModal(!editModal);
  };
  const onUpdate = async (newBlogDetails) => {
    try {
      // console.log(newBlogDetails);

      await refetch();
      setEditModal(false);
    } catch (error) {
      console.error("Update failed", error);
    }
  };

  const handleAdminDelete = async (blogId) => {
    try {
      const response = await deleteBlogAdmin(blogId);
      if (response.ok) {
        toast.success(`"${localBlog?.title}" is deleted`);
      }
    } catch (err) {
      toast.error(err?.message || "Couldn't delete");
    }
  };
  const handleCommentClick = () => {
    setCommentBox(true);
    setTimeout(() => {
      commentInputRef.current?.focus();
    }, 0);
  };

  return (
    <div>
      <div className="mx-auto w-[320px]  sm:w-4/5 p-5">
        <div className="flex justify-between">
          <h2 className="text-xl md:text-3xl font-bold mb-5">{blog?.title}</h2>
          {(userDetails?._id === blog?.author ||
            userDetails?.role === "admin") && (
            <div className="relative" ref={dropdownRef}>
              <FaEllipsisV
                className="text-teal place-self-start mt-2 cursor-pointer h-7 "
                onClick={(e) => {
                  e.stopPropagation();
                  setModelOpen(!modelOpen);
                }}
              />
              {modelOpen && (
                <div className="flex flex-col border absolute right-4  rounded-md bg-slate-100">
                  <button
                    onClick={() => handleEdit()}
                    className="btn bg-slate-100 text-black hover:bg-slate-300"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setYes(true)}
                    className="btn bg-slate-100 text-black hover:bg-slate-300"
                  >
                    {userDetails.role === "admin" ? "Hide" : "Delete"}
                  </button>
                  {userDetails.role === "admin" && (
                    <button
                      onClick={() => setYes(true)}
                      className="btn bg-slate-100 text-black hover:bg-slate-300"
                    >
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <span className=" bg-teal uppercase  rounded-full p-1  text-white">
          {blog?.category}
        </span>

        {yes && (
          <ConfirmModal
            title="Are you sure?"
            message={`Do you really want to delete "${blog.title}"?`}
            onConfirm={() => {
              userDetails.role === "admin"
                ? handleAdminDelete(blog._id)
                : handleDelete(blog);
              setYes(false);
            }}
            onCancel={() => setYes(false)}
          />
        )}
        {editModal && (
          <BlogEditModal blog={blog} onClose={onClose} onUpdate={onUpdate} />
        )}

        <Image
          src={blog?.image || "/public/placeholder-img.jpg"}
          width={400}
          height={400}
          alt={"Cover"}
          className="w-full h-[40vh] lg:h-[60vh] rounded-md object-cover mt-1 "
        />

        <div className="flex flex-col items-center justify-between gap-2  sm:flex-row sm:items-center">
          {/* Like, comment button */}
          <LikeCommentButton
            blogId={blog?._id}
            onCommentButtonClick={handleCommentClick}
          />

          {/* Author  */}
          <Link
            href={`/user/${blog?.author}`}
            className="flex items-center gap-2 self-center"
          >
            <Image
              src={author?.profilePicture || "/public/user-1699635_640.png"}
              width={50}
              height={50}
              alt="profile"
              className="w-8 h-8 rounded-full"
            />
            <p href={`/user/${blog?.author}`} className="hover:underline">
              {author?.username}
            </p>
          </Link>

          {/* Publish Time  */}
          <div className="flex items-center gap-2 self-center">
            <IoIosTimer className="text-teal" />
            <p>{publishedAgo}</p>
          </div>
        </div>

        <div className="">{blog?.content}</div>
        <h5 className="flex gap-2 flex-wrap">
          {blog?.tags.map((tag, index) => {
            const colors = [
              "#FF6B6B",
              "#6BCB77",
              "#4D96FF",
              "#FFD93D",
              "#9D4EDD",
            ];
            const randomColor =
              colors[Math.floor(Math.random() * colors.length)];
            return (
              <span
                key={index}
                style={{
                  backgroundColor: randomColor,
                  color: "white",
                  padding: "4px 8px",
                  borderRadius: "9999px", // fully rounded
                  fontSize: "0.875rem", // text-sm
                }}
              >
                {tag}
              </span>
            );
          })}
        </h5>
        {/* comment box */}
        <div className="mt-2">
          {<CommentBox ref={commentInputRef} blogId={blog?._id} />}
        </div>
      </div>

      <h2 className="font-bold m-5 md:mt-10 text-xl underline underline-offset-4 text-center decoration-teal">
        Related Blogs
      </h2>
      <RelatedBlogs blog={blog} />
    </div>
  );
};

export default BlogDetails;
