import { useState } from "react";
import { todoApi } from "../api/todos";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchData } from "../api/todos";

export default function TodoForm({ fetchData }) {
  const [title, setTitle] = useState("");
  const [contents, setContents] = useState("");
  const queryClient = useQueryClient();

  // TODO: useMutation 으로 리팩터링 하세요.

  const mutation = useMutation(
    async (newTodo) => todoApi.post("/todos", newTodo),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["todos"]);
        fetchData();
      },
    }
  );

  const handleAddTodo = async (e) => {
    e.preventDefault();
    setTitle("");
    setContents("");
    mutation.mutate({
      id: Date.now().toString(),
      title,
      contents,
      isCompleted: false,
      createdAt: Date.now(),
    });
  };

  return (
    <form onSubmit={handleAddTodo}>
      <label htmlFor="title">제목:</label>
      <input
        type="text"
        id="title"
        name="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <label htmlFor="contents">내용:</label>
      <input
        id="contents"
        name="contents"
        value={contents}
        onChange={(e) => setContents(e.target.value)}
        required
      />
      <button type="submit">추가하기</button>
    </form>
  );
}
