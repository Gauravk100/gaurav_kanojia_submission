import React, { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Bot,
  BotMessageSquare,
  Check,
  Copy,
  EllipsisVertical,
  Eraser,
  MessageCircleOff,
  Palette,
  Send,
  SendHorizontal,
  Settings,
} from 'lucide-react'
import { Highlight, themes } from 'prism-react-renderer'
import { Input } from '@/components/ui/input'
import { SYSTEM_PROMPT } from '@/constants/prompt'
import { extractCode, getMaangUserCode } from './util'
import botIcon from '../assets/chat-bot-final.svg'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

import { ModalService } from '@/services/ModalService'
import { useChromeStorage } from '@/hooks/useChromeStorage'
import { ChatHistory, parseChatHistory } from '@/interface/chatHistory'
import { VALID_MODELS, ValidModel } from '@/constants/valid_modals'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LIMIT_VALUE } from '@/lib/indexedDB'
import { useIndexDB } from '@/hooks/useIndexDB'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDrag } from '@/hooks/useDrag'

interface ChatBoxProps {
  visible: boolean
  context: {
    problemStatement: string
  }
  model: ValidModel
  apikey: string
  heandelModel: (v: ValidModel) => void
  selectedModel: ValidModel | undefined
  theme?: string
  setTheme?: any
}


export const ORIGINS = {
  leetcode: 'https://leetcode.com',
  maang: 'https://maang.in',
}



export const Themes = {
  LIGHT: 'Light',
  DARK: 'Dark',
  
};

export type ThemeTypes = typeof Themes[keyof typeof Themes]


const ChatBox: React.FC<ChatBoxProps> = ({
  context,
  visible,
  model,
  apikey,
  heandelModel,
  selectedModel,
  theme,
  // @ts-ignore
  setTheme
}) => {

  const draggableRef = useRef(null);
  const { position, handleMouseDown } = useDrag({
    ref: draggableRef
  });





  const [value, setValue] = React.useState('')
  const [chatHistory, setChatHistory] = React.useState<ChatHistory[]>([])
  const [priviousChatHistory, setPreviousChatHistory] = React.useState<
    ChatHistory[]
  >([])
  const [isResponseLoading, setIsResponseLoading] =
    React.useState<boolean>(false)
  // const chatBoxRef = useRef<HTMLDivElement>(null)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)

  const [offset, setOffset] = React.useState<number>(0)
  const [totalMessages, setTotalMessages] = React.useState<number>(0)
  const [isPriviousMsgLoading, setIsPriviousMsgLoading] =
    React.useState<boolean>(false)
  const { fetchChatHistory, saveChatHistory } = useIndexDB()

  const getProblemName = () => {
    const url = window.location.href
    const match = /\/problems\/([^/]+)/.exec(url)
    return match ? match[1] : 'Unknown Problem'
  }

  const problemName = getProblemName()
  const inputFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (lastMessageRef.current && !isPriviousMsgLoading) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    setTimeout(() => {
      inputFieldRef.current?.focus()
    }, 0)
  }, [chatHistory, isResponseLoading, visible])

  const heandelClearChat = async () => {
    const { clearChatHistory } = useIndexDB()
    await clearChatHistory(problemName)
    setChatHistory([])
    setPreviousChatHistory([])
  }

  /**
   * Handles the generation of an AI response.
   *
   * This function performs the following steps:
   * 1. Initializes a new instance of `ModalService`.
   * 2. Selects a modal using the provided model and API key.
   * 3. Determines the programming language from the UI.
   * 4. Extracts the user's current code from the document.
   * 5. Modifies the system prompt with the problem statement, programming language, and extracted code.
   * 6. Generates a response using the modified system prompt.
   * 7. Updates the chat history with the generated response or error message.
   * 8. Scrolls the chat box into view.
   *
   * @async
   * @function handleGenerateAIResponse
   * @returns {Promise<void>} A promise that resolves when the AI response generation is complete.
   */
  const handleGenerateAIResponse = async (): Promise<void> => {
    const modalService = new ModalService()

    modalService.selectModal(model, apikey)

    let programmingLanguage = 'UNKNOWN'

    const changeLanguageButton = document.querySelector(
      'button.rounded.items-center.whitespace-nowrap.inline-flex.bg-transparent.dark\\:bg-dark-transparent.text-text-secondary.group'
    )
    if (changeLanguageButton) {
      if (changeLanguageButton.textContent)
        programmingLanguage = changeLanguageButton.textContent
    }
    const userCurrentCodeContainer = document.querySelectorAll('.view-line')

    const extractedCode = extractCode(userCurrentCodeContainer)

    const systemPromptModified = SYSTEM_PROMPT.replace(
      /{{problem_statement}}/gi,
      context.problemStatement
    )
      .replace(/{{programming_language}}/g, programmingLanguage)
      .replace(/{{user_code}}/g, extractedCode)

    const PCH = parseChatHistory(chatHistory)

    const { error, success } = await modalService.generate({
      prompt: `${value}`,
      systemPrompt: systemPromptModified,
      messages: PCH,
      extractedCode: extractedCode,
    })
    
    
    
    if (error) {
      const errorMessage: ChatHistory = {
        role: 'assistant',
        content: error.message,
      }
      await saveChatHistory(problemName, [
        ...priviousChatHistory,
        { role: 'user', content: value },
        errorMessage,
      ])
      setPreviousChatHistory((prev) => [...prev, errorMessage])
      setChatHistory((prev) => {
        const updatedChatHistory: ChatHistory[] = [...prev, errorMessage]
        return updatedChatHistory
      })
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    if (success) {
      const res: ChatHistory = {
        role: 'assistant',
        content: success,
      }
      await saveChatHistory(problemName, [
        ...priviousChatHistory,
        { role: 'user', content: value },
        res,
      ])
      setPreviousChatHistory((prev) => [...prev, res])
      setChatHistory((prev) => [...prev, res])
      setValue('')
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    setIsResponseLoading(false)
    setTimeout(() => {
      inputFieldRef.current?.focus()
    }, 0)
  }

  const loadInitialChatHistory = async () => {
    const { totalMessageCount, chatHistory, allChatHistory } =
      await fetchChatHistory(problemName, LIMIT_VALUE, 0)
    setPreviousChatHistory(allChatHistory || [])

    setTotalMessages(totalMessageCount)
    setChatHistory(chatHistory)
    setOffset(LIMIT_VALUE)
  }

  useEffect(() => {
    loadInitialChatHistory()
  }, [problemName])

  const loadMoreMessages = async () => {
    if (totalMessages < offset) {
      return
    }
    setIsPriviousMsgLoading(true)
    const { chatHistory: moreMessages } = await fetchChatHistory(
      problemName,
      LIMIT_VALUE,
      offset
    )

    if (moreMessages.length > 0) {
      setChatHistory((prev) => [...moreMessages, ...prev]) // Correctly merge the new messages with the previous ones
      setOffset((prevOffset) => prevOffset + LIMIT_VALUE)
    }

    setTimeout(() => {
      setIsPriviousMsgLoading(false)
    }, 500)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (target.scrollTop === 0) {
      console.log('Reached the top, loading more messages...')
      loadMoreMessages()
    }
  }

  const onSendMessage = async (value: string) => {
    setIsResponseLoading(true)
    const newMessage: ChatHistory = { role: 'user', content: value }

    setPreviousChatHistory((prev) => {
      return [...prev, newMessage]
    })
    setChatHistory([...chatHistory, newMessage])

    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    handleGenerateAIResponse()
  }

  // @ts-ignore
  
  
  const [isCopied,setIsCopied] = useState<boolean>(false);

  console.log(theme);
  const [isMoving,setIsMoving] = useState<boolean>(false);
  
  if (!visible) return <></>
  
  

  return (
    <Card className={cn("mb-2 fixed border-2",
      
    )}
      ref={draggableRef}
      
      style={{
        backgroundColor:  '#262626'  ,
        borderColor:'#555555',
        top:((position as any).y ?? 44.9523811340332) +'px',
        left: ((position as any).x ?? 1014.952392578125) + 'px',
        
      }}
    >
      <div onMouseDown={(e) => {
        setIsMoving(true);
        handleMouseDown(e)
      }} 
      onMouseUp={() => setIsMoving(false)}
      className="flex gap-2   items-center justify-between h-20 rounded-t-lg p-4"
        style={{
          borderBottom:'2px solid #555555',
          cursor: isMoving ?  'grabbing' : 'grab'
        }}
      >
        <div className="flex gap-2 items-center justify-start">
          <div
           
           className={cn(" rounded-full p-2",
            theme === Themes.DARK ? 'bg-white' : 'bg-black'
          )}>
            <img src={
              chrome.runtime.getURL('src/assets/chat-bot-final.svg')
            } style={{
              
              width:'23px',
              height:'23px',
            }} alt="" />
          </div>
          <div className={(
              theme === Themes.LIGHT ? 'text-black' : 'text-white'
          )}>
            <h3 className="font-bold text-lg">Need Help?</h3>
            
            

            <h6 className="font-normal text-xs">Always online</h6>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button  className={cn(' p-2 rounded-md',
              theme === Themes.LIGHT ? 'dropdown' : 'dropdown-leet'  
            
            )}>
              <EllipsisVertical  style={{
                color: theme === Themes.LIGHT ? '#000' : '#fff'
              }} size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel className="flex items-center">
              <Settings size={16} strokeWidth={1.5} className="mr-2" />{' '}
              {
                VALID_MODELS.find((model) => model.name === selectedModel)
                  ?.display
              }
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Bot size={16} strokeWidth={1.5} /> Change Model
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent>
                    <DropdownMenuRadioGroup
                      value={selectedModel}
                      onValueChange={(v) => heandelModel(v as ValidModel)}
                    >
                      {VALID_MODELS.map((modelOption) => (
                        <DropdownMenuRadioItem
                          key={modelOption.name}
                          value={modelOption.name}
                        >
                          {modelOption.display}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={heandelClearChat}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  'rgb(185 28 28 / 0.35)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              <Eraser size={14} strokeWidth={1.5} /> Clear Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardContent className="p-2">
        {chatHistory.length > 0 ? (
          <ScrollArea
            className="space-y-4 h-[500px] w-[400px] p-2"
            ref={scrollAreaRef}
            onScroll={handleScroll}
          >
            {totalMessages > offset && (
              <div className="flex w-full items-center justify-center">
                <Button
                  className="text-sm p-1 m-x-auto bg-transpernent text-white hover:bg-transpernent"
                  onClick={loadMoreMessages}
                >
                  Load Previous Messages
                </Button>
              </div>
            )}
            {chatHistory.map((message, index) => {
              console.log(message);
              
              return (
              <div
                style={{
                  ...(theme === Themes.LIGHT && {
                    backgroundColor : message.role !== 'user' ? '#ddf6ff' : 'rgb(244,244,244)',
                    border:'1px solid #7bdcff',
                    color: '#000'
                  } ) ,
                  ...(theme === Themes.DARK && {
                    backgroundColor : message.role !== 'user' ? '#353535' : '#000',
                    border:message.role === 'user' ? '2px solid rgb(101,101,101)' : '',
                    color: '#fff'
                  } ) 
                }}
                key={index}
                className={cn(
                  'flex w-max max-w-[75%] flex-col gap-2 px-3 py-2 text-sm my-4',
                  message.role === 'user'
                    ? 'ml-auto   text-primary-foreground rounded-bl-lg rounded-tl-lg rounded-tr-lg '
                    : ' rounded-br-lg rounded-tl-lg rounded-tr-lg'
                )}
              >
                <>
                  <p className="max-w-80 ">
                    {typeof message.content === 'string'
                      ? message.content
                      : message.content.feedback}
                  </p>

                  {!(typeof message.content === 'string') && (
                    <Accordion type="multiple">
                      {message.content?.hints &&
                        message.content.hints.length > 0 && (
                          <AccordionItem value="item-1" className="max-w-80">
                            <AccordionTrigger>Hints 👀</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-4">
                                {message.content?.hints?.map((e) => (
                                  <li key={e}>{e}</li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      {message.content?.snippet && (
                        <AccordionItem value="item-2" className="max-w-80">
                          <AccordionTrigger>Code 🧑🏻‍💻</AccordionTrigger>

                          <AccordionContent>
                            <div className="mt-4 rounded-md">
                              <div className="relative">
                                {
                                  isCopied
                                  ?
                                  <Check className="absolute right-2 top-2 h-4 w-4" />
                                  :
                                  <Copy
                                    onClick={() => {
                                      if (typeof message.content !== 'string'){

                                        setIsCopied(true);
                                        setTimeout(()=>{
                                          setIsCopied(false);
                                        },1000)
                                        navigator.clipboard.writeText(
                                          `${message.content?.snippet}`
                                        )
                                      }
                                    }}
                                    className="absolute right-2 top-2 h-4 w-4"
                                  />
                                }
                                <Highlight
                                  theme={themes.dracula}
                                  code={(()  =>{
                                    const source = (message.content as any)?.snippet || ''
                                    if((source as string).startsWith('```')){

                                      return source.slice(3,source.length-3);
                                    }
                                    return source as string;
                                  })()}
                                  language={
                                    message.content?.programmingLanguage?.toLowerCase() ||
                                    'javascript'
                                  }
                                >
                                  {({
                                    className,
                                    style,
                                    tokens,
                                    getLineProps,
                                    getTokenProps,
                                  }) => (
                                    <pre
                                      style={style}
                                      className={cn(
                                        className,
                                        'p-3 rounded-md'
                                      )}
                                    >
                                      {tokens.map((line, i) => (
                                        <div
                                          key={i}
                                          {...getLineProps({ line })}
                                        >
                                          {line.map((token, key) => (
                                            <span
                                              key={key}
                                              {...getTokenProps({ token })}
                                            />
                                          ))}
                                        </div>
                                      ))}
                                    </pre>
                                  )}
                                </Highlight>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  )}
                </>
              </div>
            )})}
            {isResponseLoading && (
              <div className={'flex w-max h-7 py-3  items-center px-3 gap-1 my-2 '}
                style={{
                  backgroundColor: theme === Themes.LIGHT ? '#ddf6ff' : '#353535',
                  borderRadius:'10px'
                }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse "
                  style={{
                    backgroundColor: theme === Themes.LIGHT ? '#1184a9' : '#fff'
                  }}
                ></div>
                <div className="w-2 h-2 rounded-full animate-pulse delay-100 "
                  style={{
                    backgroundColor: theme === Themes.LIGHT ? '#1184a9' : '#fff'
                  }}
                ></div>
                <div className="w-2 h-2 rounded-full animate-pulse delay-200 "
                  style={{
                    backgroundColor: theme === Themes.LIGHT ? '#1184a9' : '#fff'
                  }}
                ></div>
              </div>
            )}
            <div ref={lastMessageRef} />
          </ScrollArea>
        ) : (
          <div className=''>
            <div className="flex items-center justify-center h-[510px] w-[400px] text-center space-y-4 flex-col">
              <MessageCircleOff size={37} />
              <span>

              No messages yet.
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (value.trim().length === 0) return
            onSendMessage(value)
            setValue('')
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            iclassName={cn(
              theme === Themes.DARK 
                ? 
                  'bg-black text-white  ' 
                : 
                  ' rounded-sm text-black '
            )}
            className={cn("flex-1 border-secondary border-2",
              
            )}
            style={{
              border:'2px solid #aaa',
              color:'white'
            }}
            autoComplete="off"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={isResponseLoading}
            required
            ref={inputFieldRef}
          />
          <Button
            type="submit"
            style={{
              color:theme === Themes.LIGHT ? '#fff' : '#161d29',
              background:theme === Themes.LIGHT ? 'linear-gradient(90deg,#033042,#005c83)': 'linear-gradient(90deg,hsla(0,0%,100%,.6),#eaf1fd)',
            }}
            className="bg-[#fafafa] rounded-sm "
            size="icon"
            disabled={value.length === 0}
          >
            <SendHorizontal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}
const MaangChatBox: React.FC<ChatBoxProps> = ({
  context,
  visible,
  model,
  apikey,
  heandelModel,
  selectedModel,
  theme,
  setTheme
}) => {
  const draggableRef = useRef(null);
  const { position, handleMouseDown } = useDrag({
    ref: draggableRef
  });

  const [value, setValue] = React.useState('')
  const [chatHistory, setChatHistory] = React.useState<ChatHistory[]>([])
  const [priviousChatHistory, setPreviousChatHistory] = React.useState<
    ChatHistory[]
  >([])
  const [isResponseLoading, setIsResponseLoading] =
    React.useState<boolean>(false)
  // const chatBoxRef = useRef<HTMLDivElement>(null)

  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const lastMessageRef = useRef<HTMLDivElement>(null)

  const [offset, setOffset] = React.useState<number>(0)
  const [totalMessages, setTotalMessages] = React.useState<number>(0)
  const [isPriviousMsgLoading, setIsPriviousMsgLoading] =
    React.useState<boolean>(false)
  const { fetchChatHistory, saveChatHistory } = useIndexDB()

  const getProblemName = () => {
    const url = window.location.href
    const match = /\/problems\/([^/]+)/.exec(url)
    return match ? match[1] : 'Unknown Problem'
  }

  const problemName = getProblemName()
  const inputFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (lastMessageRef.current && !isPriviousMsgLoading) {
      lastMessageRef.current.scrollIntoView({ behavior: 'smooth' })
    }
    setTimeout(() => {
      inputFieldRef.current?.focus()
    }, 0)
  }, [chatHistory, isResponseLoading, visible])

  const heandelClearChat = async () => {
    const { clearChatHistory } = useIndexDB()
    await clearChatHistory(problemName)
    setChatHistory([])
    setPreviousChatHistory([])
  }

  /**
   * Handles the generation of an AI response.
   *
   * This function performs the following steps:
   * 1. Initializes a new instance of `ModalService`.
   * 2. Selects a modal using the provided model and API key.
   * 3. Determines the programming language from the UI.
   * 4. Extracts the user's current code from the document.
   * 5. Modifies the system prompt with the problem statement, programming language, and extracted code.
   * 6. Generates a response using the modified system prompt.
   * 7. Updates the chat history with the generated response or error message.
   * 8. Scrolls the chat box into view.
   *
   * @async
   * @function handleGenerateAIResponse
   * @returns {Promise<void>} A promise that resolves when the AI response generation is complete.
   */
  const handleGenerateAIResponse = async (): Promise<void> => {
    const modalService = new ModalService()

    modalService.selectModal(model, apikey)

    let programmingLanguage = localStorage.getItem('editor-language') || 'C++14'

    const problemCode = location.href.split('-').slice(-1);

    const matchingSuffix = problemCode+ '_' + programmingLanguage;

    console.log(matchingSuffix);
    
    
    

    const extractedCode = getMaangUserCode(matchingSuffix);
    console.log(extractedCode);
    

    const systemPromptModified = SYSTEM_PROMPT.replace(
      /{{problem_statement}}/gi,
      context.problemStatement
    )
      .replace(/{{programming_language}}/g, programmingLanguage)
      .replace(/{{user_code}}/g, extractedCode)

    const PCH = parseChatHistory(chatHistory)

    const { error, success } = await modalService.generate({
      prompt: `${value}`,
      systemPrompt: systemPromptModified,
      messages: PCH,
      extractedCode: extractedCode,
    })

    if (error) {
      const errorMessage: ChatHistory = {
        role: 'assistant',
        content: error.message,
      }
      console.log(error);
      
      await saveChatHistory(problemName, [
        ...priviousChatHistory,
        { role: 'user', content: value },
        errorMessage,
      ])
      setPreviousChatHistory((prev) => [...prev, errorMessage])
      setChatHistory((prev) => {
        const updatedChatHistory: ChatHistory[] = [...prev, errorMessage]
        return updatedChatHistory
      })
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    if (success) {
      const res: ChatHistory = {
        role: 'assistant',
        content: success,
      }
      console.log(success);
      
      await saveChatHistory(problemName, [
        ...priviousChatHistory,
        { role: 'user', content: value },
        res,
      ])
      setPreviousChatHistory((prev) => [...prev, res])
      setChatHistory((prev) => [...prev, res])
      setValue('')
      lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    setIsResponseLoading(false)
    setTimeout(() => {
      inputFieldRef.current?.focus()
    }, 0)
  }

  const loadInitialChatHistory = async () => {
    const { totalMessageCount, chatHistory, allChatHistory } =
      await fetchChatHistory(problemName, LIMIT_VALUE, 0)
    setPreviousChatHistory(allChatHistory || [])

    setTotalMessages(totalMessageCount)
    setChatHistory(chatHistory)
    setOffset(LIMIT_VALUE)
  }

  useEffect(() => {
    loadInitialChatHistory()
  }, [problemName])

  const loadMoreMessages = async () => {
    if (totalMessages < offset) {
      return
    }
    setIsPriviousMsgLoading(true)
    const { chatHistory: moreMessages } = await fetchChatHistory(
      problemName,
      LIMIT_VALUE,
      offset
    )

    if (moreMessages.length > 0) {
      setChatHistory((prev) => [...moreMessages, ...prev]) // Correctly merge the new messages with the previous ones
      setOffset((prevOffset) => prevOffset + LIMIT_VALUE)
    }

    setTimeout(() => {
      setIsPriviousMsgLoading(false)
    }, 500)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (target.scrollTop === 0) {
      console.log('Reached the top, loading more messages...')
      loadMoreMessages()
    }
  }

  const onSendMessage = async (value: string) => {
    setIsResponseLoading(true)
    const newMessage: ChatHistory = { role: 'user', content: value }

    setPreviousChatHistory((prev) => {
      return [...prev, newMessage]
    })
    setChatHistory([...chatHistory, newMessage])

    lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' })
    handleGenerateAIResponse()
  }

  
  const [isCopied,setIsCopied] = useState<boolean>(false);
  
  const [isMoving,setIsMoving] = useState<boolean>(false);

  

  
  
  

  if (!visible) return <></>

  

  return (
    <Card className={cn("mb-2 fixed")}
      ref={draggableRef}
      style={{
        backgroundColor: theme === Themes.LIGHT ? '#fff' : '#161d29',
        color: theme === Themes.LIGHT ? '#000' : '#fff',
        top:((position as any).y ?? 37.9523811340332) +'px',
        left: ((position as any).x ?? 1014.952392578125) + 'px',
      }}
    >
      <div onMouseDown={(e) => {
        setIsMoving(true);
        handleMouseDown(e)
      }} 
      onMouseUp={() => setIsMoving(false)}
      className="flex gap-2   items-center justify-between h-20 rounded-t-lg p-4"
        style={{
          borderBottom:'2px solid ',
          borderColor: theme === Themes.DARK ? '#29373d' : '#daf6ff',
          cursor: isMoving ?  'grabbing' : 'grab'
        }}
      >
        <div className="flex gap-2 items-center justify-start">
          <div className={cn(" rounded-full p-2",
            
          )}
            style={{
              background : theme === Themes.LIGHT ? '#daf6ff' : '#29373d'
            }}
          >
            
            
            <img src={
              chrome.runtime.getURL('src/assets/chat-bot-final.svg')
            } style={{
              filter:theme === Themes.DARK ? 'invert(1)' : '',
              width:'23px',
              height:'23px',
            }} alt="" />
          </div>
          <div className={(
              theme === Themes.LIGHT ? 'text-black' : 'text-white'
          )}>
            <h3 className="font-bold text-lg">Need Help?</h3>
            
            {/* <p>{theme}</p> */}

            <h6 className="font-normal text-xs">Always online</h6>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button  className={cn(' p-2 rounded-md',
              theme === Themes.LIGHT ? 'dropdown' : 'dropdown-dark'  
            
            )}>
              <EllipsisVertical  style={{
                color: theme === Themes.LIGHT ? '#000' : '#fff'
              }} size={18} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className={cn("w-56 ",
            theme === Themes.LIGHT ? '' : 'dark'
          )}
            style={{
              backgroundColor: theme === Themes.LIGHT ? '#fff' : '#161d29',
              color: theme === Themes.LIGHT ? '#000' : '#fff'
            }}
          >
            <DropdownMenuLabel className="flex items-center">
              <Settings size={16} strokeWidth={1.5} className="mr-2" />{' '}
              {
                VALID_MODELS.find((model) => model.name === selectedModel)
                  ?.display
              }
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Bot size={16} strokeWidth={1.5} /> Change Model
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className={cn(
                    theme === Themes.LIGHT ? '' : 'dark'
                  )}
                    style={{
                      backgroundColor: theme === Themes.LIGHT ? '#fff' : '#161d29',
                    }}
                  >
                    <DropdownMenuRadioGroup
                      value={selectedModel}
                      onValueChange={(v) => heandelModel(v as ValidModel)}
                    >
                      {VALID_MODELS.map((modelOption) => (
                        <DropdownMenuRadioItem
                          key={modelOption.name}
                          value={modelOption.name}
                        >
                          {modelOption.display}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Palette size={16} strokeWidth={1.5} /> Select Theme
                </DropdownMenuSubTrigger>
                <DropdownMenuPortal>
                  <DropdownMenuSubContent className={cn(
                    theme === Themes.LIGHT ? '' : 'dark'
                  )}
                    style={{
                      backgroundColor: theme === Themes.LIGHT ? '#fff' : '#161d29',
                    }}
                  >
                    <DropdownMenuRadioGroup
                      value={theme}
                      onValueChange={(v) => {
                        
                        setTheme(v)
                      }}
                    >
                      {Object.keys(Themes).map((theme) => (
                        <DropdownMenuRadioItem
                          key={(Themes as any)[theme]}
                          value={(Themes as any)[theme]}
                        >
                          {(Themes as any)[theme]}
                        </DropdownMenuRadioItem>
                      ))}
                    </DropdownMenuRadioGroup>
                  </DropdownMenuSubContent>
                </DropdownMenuPortal>
              </DropdownMenuSub>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={heandelClearChat}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  'rgb(185 28 28 / 0.35)')
              }
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
            >
              <Eraser size={14} strokeWidth={1.5} /> Clear Chat
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <CardContent className="p-2">
        {chatHistory.length > 0 ? (
          <ScrollArea
            className={`space-y-4 h-[500px] w-[400px] p-2 custom-scroll`}
            ref={scrollAreaRef}
            onScroll={handleScroll}
          >
            {totalMessages > offset && (
              <div className="flex w-full items-center justify-center">
                <Button
                  className="text-sm p-1 m-x-auto bg-transpernent text-white hover:bg-transpernent"
                  onClick={loadMoreMessages}
                >
                  Load Previous Messages
                </Button>
              </div>
            )}
            {chatHistory.map((message, index) => {
            console.log(message);
            
            return(
              
              
              <div
                style={{
                  ...(theme === Themes.LIGHT && {
                    backgroundColor : message.role !== 'user' ? '#ddf6ff' : 'rgb(244,244,244)',
                    border:'1px solid #7bdcff',
                    color: '#000'
                  } ) ,
                  ...(theme === Themes.DARK && {
                    backgroundColor : message.role !== 'user' ? '#2b384e' : '#2D343f',
                    border:message.role === 'user' ? '2px solid rgb(101,101,101)' : '',
                    color: '#fff'
                  } ) 
                }}
                key={index}
                className={cn(
                  `flex w-max max-w-[75%] flex-col gap-2 px-3 py-2 text-sm my-4 overflow-x-auto text-ellipsis
                    
                  `,
                  message.role === 'user'
                    ? 'ml-auto   text-primary-foreground rounded-bl-lg rounded-tl-lg rounded-tr-lg '
                    : 'bg-muted rounded-br-lg rounded-tl-lg rounded-tr-lg'
                    ,
                  theme === Themes.LIGHT ? 'custom-scroll' : 'custom-scroll'
                )}
              >
                <>
                  <p className="max-w-80 ">
                    {typeof message.content === 'string'
                      ? message.content
                      : message.content.feedback}
                  </p>

                  {!(typeof message.content === 'string') && (
                    <Accordion type="multiple">
                      {message.content?.hints &&
                        message.content.hints.length > 0 && (
                          <AccordionItem value="item-1" className="max-w-80 "
                            
                          >
                            <AccordionTrigger style={{
                              height:'10px'
                            }}>Hints 👀</AccordionTrigger>
                            <AccordionContent>
                              <ul className="space-y-4">
                                {message.content?.hints?.map((e) => (
                                  <li key={e}>{e}</li>
                                ))}
                              </ul>
                            </AccordionContent>
                          </AccordionItem>
                        )}
                      {message.content?.snippet && (
                        <AccordionItem value="item-2" className="max-w-80">
                          <AccordionTrigger>Code 🧑🏻‍💻</AccordionTrigger>

                          <AccordionContent>
                            <div className="mt-4 rounded-md">
                              <div className="relative">
                                {
                                  isCopied
                                  ?
                                    <Check className='absolute right-2 top-2 h-4 w-4' />
                                  :
                                  <Copy
                                    onClick={() => {
                                      if (typeof message.content !== 'string'){
                                        setIsCopied(true)
                                        navigator.clipboard.writeText(
                                          `${message.content?.snippet}`
                                        )
                                        setTimeout(() => {
                                          setIsCopied(false)
                                        },1000)
                                      }
                                    }}
                                    className="absolute right-2 top-2 h-4 w-4"
                                  />
                                }
                                <Highlight
                                  theme={theme === Themes.LIGHT ? themes.oneLight : themes.dracula}
                                  code={(()  =>{
                                    const source = (message.content as any)?.snippet || ''
                                    if((source as string).startsWith('```')){

                                      return source.slice(3,source.length-3);
                                    }
                                    return source as string;
                                  })()}
                                  language={
                                    message.content?.programmingLanguage?.toLowerCase() ||
                                    'javascript'
                                  }
                                >
                                  {({
                                    className,
                                    style,
                                    tokens,
                                    getLineProps,
                                    getTokenProps,
                                  }) => (
                                    <pre
                                      style={style}
                                      className={cn(
                                        className,
                                        'p-3 rounded-md'
                                      )}
                                    >
                                      {tokens.map((line, i) => (
                                        <div
                                          key={i}
                                          {...getLineProps({ line })}
                                        >
                                          {line.map((token, key) => (
                                            <span
                                              key={key}
                                              {...getTokenProps({ token })}
                                            />
                                          ))}
                                        </div>
                                      ))}
                                    </pre>
                                  )}
                                </Highlight>
                              </div>
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )}
                    </Accordion>
                  )}
                </>
              </div>
            )})}
            {isResponseLoading && (
              <div className={'flex w-max h-6 py-3  items-center px-3 gap-1 my-2 '}
                style={{
                  backgroundColor: theme === Themes.LIGHT ? '#ddf6ff' : '#2b384e',
                  borderRadius:'10px'
                }}
              >
                <div className="w-2 h-2 rounded-full animate-pulse "
                  style={{
                    backgroundColor: theme === Themes.LIGHT ? '#1184a9' : '#fff'
                  }}
                ></div>
                <div className="w-2 h-2 rounded-full animate-pulse delay-100 "
                  style={{
                    backgroundColor: theme === Themes.LIGHT ? '#1184a9' : '#fff'
                  }}
                ></div>
                <div className="w-2 h-2 rounded-full animate-pulse delay-200 "
                  style={{
                    backgroundColor: theme === Themes.LIGHT ? '#1184a9' : '#fff'
                  }}
                ></div>
              </div>
            )}
            <div ref={lastMessageRef} />
          </ScrollArea>
        ) : (
          <div className=''>
            <div className="flex items-center justify-center h-[510px] w-[400px] text-center space-y-4 flex-col">
              <MessageCircleOff size={37} />
              <span>

              No messages yet.
              </span>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (value.trim().length === 0) return
            onSendMessage(value)
            setValue('')
          }}
          className="flex w-full items-center space-x-2"
        >
          <Input
            id="message"
            placeholder="Type your message..."
            iclassName={cn(
              theme === Themes.DARK 
                ? 
                  'bg-black text-white' 
                : 
                  ' rounded-sm text-black '
            )}
            className={cn("flex-1 ",
              
            )}
            autoComplete="off"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            disabled={isResponseLoading}
            required
            ref={inputFieldRef}
          />
          <Button
            type="submit"
            style={{
              color:theme === Themes.LIGHT ? '#fff' : '#161d29',
              background:theme === Themes.LIGHT ? 'linear-gradient(90deg,#033042,#005c83)': 'linear-gradient(90deg,hsla(0,0%,100%,.6),#eaf1fd)',
            }}
            className="bg-[#fafafa] rounded-sm "
            size="icon"
            disabled={value.length === 0}
          >
            <SendHorizontal className="h-4 w-4" />
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </CardFooter>
    </Card>
  )
}


const MaangContentPage: React.FC = () => {
  
  
  
  const [chatboxExpanded, setChatboxExpanded] = React.useState<boolean>(false)




  const metaDescriptionEl = document.querySelector('meta[name=description]')
  let problemStatement = metaDescriptionEl?.getAttribute('content') as string

  if(location.origin === ORIGINS.maang){
    const maangProblemStatement = document.getElementsByClassName('problem-paragraph');

    problemStatement = Array.from(maangProblemStatement).map((e) => e.textContent).join(' ')

  }

  const [modal, setModal] = React.useState<ValidModel | null | undefined>(null)
  const [apiKey, setApiKey] = React.useState<string | null | undefined>(null)
  const [selectedModel, setSelectedModel] = React.useState<ValidModel>()

  const ref = useRef<HTMLDivElement>(null)

  const handleDocumentClick = (e: MouseEvent) => {
    if (
      ref.current &&
      e.target instanceof Node &&
      !ref.current.contains(e.target)
    ) {
      // if (chatboxExpanded) setChatboxExpanded(false)
    }
  }

  React.useEffect(() => {
    document.addEventListener('click', handleDocumentClick)
    return () => {
      document.removeEventListener('click', handleDocumentClick)
    }
  }, [])
  ;(async () => {
    const { getKeyModel, selectModel } = useChromeStorage()
    const { model, apiKey } = await getKeyModel(await selectModel())

    setModal(model)
    setApiKey(apiKey)
  })()

  const heandelModel = (v: ValidModel) => {
    if (v) {
      const { setSelectModel } = useChromeStorage()
      setSelectModel(v)
      setSelectedModel(v)
    }
  }

  React.useEffect(() => {
    const loadChromeStorage = async () => {
      if (!chrome) return

      const { selectModel } = useChromeStorage()

      setSelectedModel(await selectModel())
    }

    loadChromeStorage()
  }, [])

  const [theme,setTheme] = useState<ThemeTypes>(Themes.DARK);

  useEffect(() => {

    if(location.origin === ORIGINS.leetcode){
      return;
    }

    const setInitialTheme = () => {
      const initialTheme = document.documentElement.getAttribute('data-theme');
      if (initialTheme === 'dark'){
        setTheme(Themes.DARK);
      }else{
        setTheme(Themes.LIGHT);
      }
      
    }


    const observerCallback = (mutationsList:any) => {
      for (const mutation of mutationsList) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.getAttribute('data-theme');
          console.log(newTheme);
          
          
          if(newTheme === 'dark' ){
            setTheme(Themes.DARK);
          }else{
            setTheme(Themes.LIGHT);
          }
          
        }
      }
    };

    // Create a MutationObserver instance
    const observer = new MutationObserver(observerCallback);


    setInitialTheme();
    // Observe changes to the <html> element's attributes
    observer.observe(document.documentElement, { attributes: true });

    return () => {
      // Cleanup: Disconnect the observer
      observer.disconnect();
    };

  },[])


  



  return (
    <div
      ref={ref}
      className="dark z-50"
      style={{
        position: 'fixed',
        bottom: '30px',
        right: '30px',
      }}
    >
      {!modal || !apiKey ? (
        !chatboxExpanded ? null : (
          location.origin === ORIGINS.leetcode
          ?
            <>
              <Card className="mb-5 bg-secondary"
                style={{
                  border:'2px solid #666'
                }}
              >
                <CardContent className="h-[500px] grid place-items-center">
                  <div className="grid place-items-center gap-4">
                    {!selectedModel && (
                      <>
                        <p className="text-center">
                          Please configure the extension before using this
                          feature.
                        </p>
                        <Button
                          
                          onClick={() => {
                            chrome.runtime.sendMessage({ action: 'openPopup' })
                          }}
                        >
                          configure
                        </Button>
                      </>
                    )}
                    {selectedModel && (
                      <>
                        <p>
                          We couldn't find any API key for selected model{' '}
                          <b>
                            <u>{selectedModel}</u>
                          </b>
                        </p>
                        <p>you can select another models</p>
                        <Select
                          onValueChange={(v: ValidModel) => heandelModel(v)}
                          value={selectedModel}
                        >
                          <SelectTrigger className="w-56">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Model</SelectLabel>
                              <SelectSeparator />
                              {VALID_MODELS.map((modelOption) => (
                                <SelectItem
                                  key={modelOption.name}
                                  value={modelOption.name}
                                >
                                  {modelOption.display}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
          :
            <>
              <Card className="mb-5 "
                style={{
                  backgroundColor: theme === Themes.LIGHT ? '#fff' : '#161d29',
                }}
              >
                <CardContent className="h-[500px] grid place-items-center">
                  <div className="grid place-items-center gap-4">
                    {!selectedModel && (
                      <>
                        <p className="text-center "
                          style={{
                            color: theme === Themes.LIGHT ? '#000' : '#fff'
                          }}
                        >
                          Please configure the extension before using this
                          feature.
                        </p>
                        <button
                          style={{
                            background: theme === Themes.LIGHT ? 'linear-gradient(90deg,#033042,#005c83)' : '#fff',
                            // border:theme === Themes.LIGHT ?  '2px solid #7bdcff' : '2px solid #fff',
                            color:theme === Themes.LIGHT ? '#fff' : '#000',
                          }}
                          className='p-2 px-3 rounded-xl'
                          onClick={() => {
                            chrome.runtime.sendMessage({ action: 'openPopup' })
                          }}
                        >
                          configure
                        </button>
                      </>
                    )}
                    {selectedModel && (
                      <>
                        <p>
                          We couldn't find any API key for selected model{' '}
                          <b>
                            <u>{selectedModel}</u>
                          </b>
                        </p>
                        <p>you can select another models</p>
                        <Select
                          onValueChange={(v: ValidModel) => heandelModel(v)}
                          value={selectedModel}
                        >
                          <SelectTrigger className="w-56">
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Model</SelectLabel>
                              <SelectSeparator />
                              {VALID_MODELS.map((modelOption) => (
                                <SelectItem
                                  key={modelOption.name}
                                  value={modelOption.name}
                                >
                                  {modelOption.display}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </>
        )
      ) : (
        
        location.origin === ORIGINS.leetcode
        ?

          <ChatBox
            visible={chatboxExpanded}
            context={{ problemStatement }}
            model={modal}
            apikey={apiKey}
            heandelModel={heandelModel}
            selectedModel={selectedModel}
            theme={theme}
          />
        :
          <MaangChatBox
            visible={chatboxExpanded}
            context={{ problemStatement }}
            model={modal}
            apikey={apiKey}
            heandelModel={heandelModel}
            selectedModel={selectedModel}
            theme={theme}
            setTheme={setTheme}
          />
      )}
      <div className="flex justify-end">
        <button
          className='w-10 p-2 rounded-xl'
          style={
            location.origin === ORIGINS.maang ? {
              backgroundColor: theme === Themes.LIGHT ?  '#daf6ff' : '#29373d',
              border:theme === Themes.LIGHT ?  '2px solid #7bdcff' : '2px solid #fff',
            }
            :
            {
              backgroundColor: theme === Themes.LIGHT ?  '#daf6ff' : '#121212',
              border:theme === Themes.LIGHT ?  '2px solid #7bdcff' : '2px solid #666666',
            }
          }
          onClick={() => setChatboxExpanded(!chatboxExpanded)}
        >
          
          <img src={
            chrome.runtime.getURL('src/assets/chat-bot-final.svg')
          } style={{
            filter:theme === Themes.DARK ? 'invert(1)' : '',
            width:'23px',
            height:'23px',
          }} alt="" />
        </button>
      </div>
    </div>
  )
}

export default MaangContentPage
