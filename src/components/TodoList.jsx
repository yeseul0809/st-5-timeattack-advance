import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { todoApi } from "../api/todos";

export default function TodoList() {
  const navigate = useNavigate();
  const {
    data: todos,
    error,
    isPending,
    refetch,
  } = useQuery({
    queryKey: ["todos"],
    queryFn: async () => {
      const response = await todoApi.get("/todos");
      return response.data;
    },
  });

  // TODO: 아래 handleLike 로 구현되어 있는 부분을 useMutation 으로 리팩터링 해보세요. 모든 기능은 동일하게 동작해야 합니다.
  const queryClient = useQueryClient();

  //
  // const handleLike = async (id, currentLiked) => {
  //   const previousTodos = [...todos];
  //   try {
  //     queryClient.setQueryData(["todos"], (prev) =>
  //       prev.map((todo) =>
  //         todo.id === id ? { ...todo, liked: !todo.liked } : todo,
  //       ),
  //     );
  //     await todoApi.patch(`/todos/${id}`, {
  //       liked: !currentLiked,
  //     });
  //   } catch (err) {
  //     console.error(err);
  //     queryClient.setQueryData(["todos"], previousTodos);
  //   } finally {
  //     refetch();
  //   }
  // };
  //

  const mutation = useMutation(
    async ({ id, currentLiked }) => {
      await todoApi.patch(`/todos/${id}`, {
        liked: !currentLiked,
      });
    },
    {
      onMutate: async ({ id, currentLiked }) => {
        await queryClient.cancelQueries(["todos"]);
        const previousTodos = queryClient.getQueryData(["todos"]);

        queryClient.setQueryData(["todos"], (old) =>
          old.map((todo) =>
            todo.id === id ? { ...todo, liked: !todo.liked } : todo
          )
        );
        return { previousTodos };
      },
      onError: (err, _, context) => {
        queryClient.setQueryData(["todos"], context.previousTodos);
      },
      onSettled: () => {
        queryClient.invalidateQueries(["todos"]);
      },
    }
  );

  const handleLike = async (id, currentLiked) => {
    mutation.mutate({ id, currentLiked });
  };

  if (isPending) {
    return <div style={{ fontSize: 36 }}>로딩중...</div>;
  }

  if (error) {
    console.error(error);
    return (
      <div style={{ fontSize: 24 }}>에러가 발생했습니다: {error.message}</div>
    );
  }

  return (
    <ul style={{ listStyle: "none", width: 250 }}>
      {todos.map((todo) => (
        <li
          key={todo.id}
          style={{
            border: "1px solid black",
            padding: "10px",
            marginBottom: "10px",
          }}
        >
          <h3>{todo.title}</h3>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <button onClick={() => navigate(`/detail/${todo.id}`)}>
              내용보기
            </button>
            {todo.liked ? (
              <FaHeart
                onClick={() => handleLike(todo.id, todo.liked)}
                style={{ cursor: "pointer" }}
              />
            ) : (
              <FaRegHeart
                onClick={() => handleLike(todo.id, todo.liked)}
                style={{ cursor: "pointer" }}
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
