import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { FC,  useState, useEffect } from 'react';
import { notify } from "../utils/notifications";

import { Program, AnchorProvider, web3, utils, BN, setProvider } from "@coral-xyz/anchor"
import idl from "./blog_dapp.json"
import { BlogDapp } from './blog_dapp';
import { PublicKey } from '@solana/web3.js';

const idl_string = JSON.stringify(idl)
const idl_object = JSON.parse(idl_string)
const programID = new PublicKey(idl.address)

interface CurrentPost {
  pubkey: string;
  topic: string;
  content: string;
}

export const Post: FC = () => {
  const ourWallet = useWallet();
  const { connection } = useConnection()
  const [posts, setPosts] = useState([])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<CurrentPost>({
    pubkey: '',
    topic: '',
    content: ''
  });

  const toggleCreateModal = () => {
    setIsCreateModalOpen(!isCreateModalOpen);
  };
  const toggleUpdateModal = (post) => {
    setCurrentPost(post);
    setIsUpdateModalOpen(!isUpdateModalOpen);
  };
  

  const getProvider = () => {
    const provider = new AnchorProvider(connection, ourWallet, AnchorProvider.defaultOptions())
    setProvider(provider)
    return provider
  }


  const getPosts = async () => {
    try {
      const anchProvider = getProvider()
      const program = new Program<BlogDapp>(idl_object, anchProvider)
      Promise.all((await connection.getParsedProgramAccounts(programID)).map(async post =>({
      ...(await program.account.post.fetch(post.pubkey)),
        pubkey: post.pubkey
      }))).then(posts => {
          //console.log(posts)
          setPosts(posts)
        })
      console.info("Posts fetched successfully")

    } catch (error){
      console.error("Error while geting post:" + error) 
      notify({ type: 'error', message: `Error while getting post`});
    }
  }

  

  const [create_topic, setCreateTopic] = useState('');
  const [create_content, setCreateContent] = useState('');

  const createPost = async (topic, content) => {
    try {
      const anchProvider = getProvider()
      const program = new Program<BlogDapp>(idl_object, anchProvider)

      await program.methods.create(topic, content).accounts({
        postAuthority: anchProvider.publicKey
      }).rpc()
      console.info("Posts created successfully")
      getPosts();
      toggleCreateModal();
      notify({ type: 'success', message: `Post created successfully`});
    } catch (error){
      console.error("Error while creating post:" + error) 
      notify({ type: 'error', message: `Error while creating post`});
    }
  }


  const updatePost = async (topic, content, post_pubkey) => {
    try {
      const anchProvider = getProvider()
      const program = new Program<BlogDapp>(idl_object, anchProvider)

      await program.methods.update(topic, content).accounts({
        postAuthority: anchProvider.publicKey,
      }).rpc()
      console.info("Post update successfully")
      getPosts();
      toggleUpdateModal({
        topic: topic,
        content: content,
        pubkey: post_pubkey
      });
      notify({ type: 'success', message: `Post update successfully`});
    } catch {
      console.error("Error while updating post")
      notify({ type: 'error', message: `Error while updating post`});
    }
  }



  const deletePost = async (topic, post_pubkey) => {
    try {
      const anchProvider = getProvider()
      const program = new Program<BlogDapp>(idl_object, anchProvider)

      await program.methods.delete(topic).accounts({
        postAuthority: anchProvider.publicKey,
      }).rpc()
      console.info("Post deleted successfully")
      getPosts();
      notify({ type: 'success', message: `Post deleted successfully`});
    } catch {
      console.error("Error while deleting post")
      notify({ type: 'error', message: `Error while deleting post`});
    }
  }


  const provider: PublicKey = getProvider().publicKey;
  useEffect(() => {
      getPosts();
  }, []); // The empty dependency array ensures this runs only once on component mount.



  return (
    <div>
    <div className="flex flex-row justify-center">
      <div className="relative group items-center">
        <div className="m-1 absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-fuchsia-500 
                rounded-lg blur opacity-20 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
        <button
          className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
          onClick={toggleCreateModal}
        >
          <div className="hidden group-disabled:block">
            Wallet not connected
          </div>
          <span className="block group-disabled:hidden" >
            Create Post 
          </span>
        </button>
      </div>
    </div>
      {
                posts.map((post) => {
                    const topicString = Buffer.from(post.topic.slice(0, post.topicLength)).toString('utf-8');
                    const contentString = Buffer.from(post.content).toString('utf-8').replace(/\0/g, '');
                    return (
                        <div key={topicString} className='md:hero-content flex flex-col'>
               <div className="max-w-xl bg-gradient-to-br from-indigo-900 to-fuchsia-900 rounded-md p-5 mb-10">
        <h1 className="font-bold text-2xl mb-2">{topicString}</h1>
        <p className="my-3 text-left">{contentString}</p>
    <div className="flex flex-row justify-center">
      <div className="relative group items-center">
                     {provider && post?.postAuthor && provider.equals(post.postAuthor) && (
            <>
                <button
                    className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                    onClick={() => deletePost(topicString, post.pubkey)}
                >
                    <span>Delete</span>
                </button>
                <button
                    className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                    onClick={() =>
                        toggleUpdateModal({
                            topic: topicString,
                            content: contentString,
                            pubkey: post.pubkey,
                        })
                    }
                >
                    <span>Update</span>
                </button>
            </>
        )}
                            </div>
                            </div>
    </div>
                        </div>

                    )
                })
            }


      {/* Modal */}
      {isCreateModalOpen && (
        <div
          id="crud-modal"
          aria-hidden={!isCreateModalOpen}
          className="fixed inset-0 z-50 flex justify-center items-center w-full h-[calc(100%-1rem)] max-h-full bg-gray-900 bg-opacity-50"
        >
          <div className="relative p-4 w-full max-w-md max-h-full">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow bg-gradient-to-br from-indigo-900 to-fuchsia-900">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Create New Post
                </h3>
                <button
                  type="button"
                  onClick={toggleCreateModal}
                  className="text-gray-400 bg-transparent hover:bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* Modal body */}
              <form className="p-4 md:p-5"
                 onSubmit={(e) => {
                    e.preventDefault(); // Prevent form submission from reloading the page
                    createPost(create_topic, create_content);
                 }}
              >
                <div className="grid gap-4 mb-4 grid-cols-2">
                  <div className="col-span-2">
                    <label
                      htmlFor="name"
                      className="text-left block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Topic
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      onChange={(e) => setCreateTopic(e.target.value)}
                      className=" bg-gray-50 border border-gray-300 bg-gradient-to-br from-indigo-700 to-fuchsia-700 text-sm rounded-lg  block w-full p-2.5 text-white dark:focus:ring-primary-500"
                      placeholder="Type post topic"
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <label
                      htmlFor="description"
                      className="text-left block mb-2 text-sm font-medium text-gray-900 dark:text-white"
                    >
                      Post content
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      onChange={(e) => setCreateContent(e.target.value)}
                      className="block p-2.5 w-full text-sm  bg-gradient-to-br from-indigo-700 to-fuchsia-700 rounded-lg border border-gray-300  dark:placeholder-gray-400 text-white"
                      placeholder="Write post content here"
                    ></textarea>
                  </div>
                </div>
                            <button
                                className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                type='submit'>
                                <span>
                                   Create post
                                </span>
                            </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      {isUpdateModalOpen && (
        <div
          id="crud-modal"
          aria-hidden={!isUpdateModalOpen}
          className="fixed inset-0 z-50 flex justify-center items-center w-full h-[calc(100%-1rem)] max-h-full bg-gray-900 bg-opacity-50"
        >
          <div className="relative p-4 w-full max-w-md max-h-full">
            {/* Modal content */}
            <div className="relative bg-white rounded-lg shadow bg-gradient-to-br from-indigo-900 to-fuchsia-900">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Update Post
                </h3>
                <button
                  type="button"
                  onClick={toggleUpdateModal}
                  className="text-gray-400 bg-transparent hover:bg-gradient-to-br from-indigo-500 to-fuchsia-500 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    className="w-3 h-3"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 14"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              {/* Modal body */}
              <form className="p-4 md:p-5"
                 onSubmit={(e) => {
                    e.preventDefault(); // Prevent form submission from reloading the page
                    updatePost(currentPost.topic, currentPost.content, currentPost.pubkey);
                 }}
              >
                <div className="grid gap-4 mb-4 grid-cols-2">
                  <div className="col-span-2">
                    <label
                      htmlFor="description"
                      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white text-left"
                    >
                      Post content
                    </label>
                    <textarea
                      id="description"
                      rows={4}
                      onChange={(e) => setCurrentPost({
                        ...currentPost,
                        content: e.target.value})}
                      value={currentPost.content}
                      className="block p-2.5 w-full text-sm  bg-gradient-to-br from-indigo-700 to-fuchsia-700 rounded-lg border border-gray-300  dark:placeholder-gray-400 text-white"
                      placeholder="Write post content here"
                    ></textarea>
                  </div>
                </div>
                            <button
                                className="group w-60 m-2 btn animate-pulse bg-gradient-to-br from-indigo-500 to-fuchsia-500 hover:from-white hover:to-purple-300 text-black"
                                type='submit'>
                                <span>
                                   Update post
                                </span>
                            </button>
              </form>
            </div>
          </div>
        </div>
      )}
       
    </div>
  );
};
